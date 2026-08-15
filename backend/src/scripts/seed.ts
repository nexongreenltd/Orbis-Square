import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

/**
 * Product images are on-brand SVG placeholders served by the storefront from
 * `public/products`. Replace them with real photography from the admin panel.
 */
const img = (slug: string) => ({ url: `/products/${slug}.svg` });

/** Every price in this seed is Bangladeshi Taka, expressed in whole Taka. */
const bdt = (amount: number) => [{ amount, currency_code: "bdt" }];

const SALES_CHANNEL_NAME = "Orbis Square Online";

export default async function seedOrbisSquareData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["bd"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();

  // Medusa bootstraps a "Default Sales Channel" together with a publishable key
  // already linked to it. Rename that channel rather than adding a second one:
  // a publishable key bound to more than one channel makes inventory
  // availability ambiguous and breaks the product pages.
  const existingChannels =
    await salesChannelModuleService.listSalesChannels({});

  let defaultSalesChannel = existingChannels.filter(
    (channel) => channel.name === SALES_CHANNEL_NAME
  );

  if (!defaultSalesChannel.length) {
    if (existingChannels.length) {
      const renamed = await salesChannelModuleService.updateSalesChannels(
        existingChannels[0].id,
        { name: SALES_CHANNEL_NAME }
      );
      defaultSalesChannel = [renamed];
    } else {
      const { result: salesChannelResult } = await createSalesChannelsWorkflow(
        container
      ).run({
        input: {
          salesChannelsData: [{ name: SALES_CHANNEL_NAME }],
        },
      });
      defaultSalesChannel = salesChannelResult;
    }
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [{ currency_code: "bdt", is_default: true }],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        name: "Orbis Square",
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Bangladesh",
          currency_code: "bdt",
          countries,
          // `pp_system_default` is Medusa's manual/offline provider — keep it as
          // a cash-on-delivery style fallback alongside PayPlus.
          payment_providers: ["pp_system_default", "pp_payplus_payplus"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Dhaka Warehouse",
          address: {
            city: "Dhaka",
            country_code: "BD",
            address_1: "Agargaon, Sher-e-Bangla Nagar",
            postal_code: "1207",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Default Shipping Profile", type: "default" }],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Bangladesh Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Bangladesh",
        geo_zones: [{ country_code: "bd", type: "country" }],
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  const shippingRules = [
    { attribute: "enabled_in_store", value: "true", operator: "eq" as const },
    { attribute: "is_return", value: "false", operator: "eq" as const },
  ];

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Inside Dhaka",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Inside Dhaka",
          description: "Delivered within Dhaka city in 1-2 working days.",
          code: "inside-dhaka",
        },
        prices: [
          { currency_code: "bdt", amount: 60 },
          { region_id: region.id, amount: 60 },
        ],
        rules: shippingRules,
      },
      {
        name: "Outside Dhaka",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Outside Dhaka",
          description: "Courier delivery nationwide in 2-4 working days.",
          code: "outside-dhaka",
        },
        prices: [
          { currency_code: "bdt", amount: 130 },
          { region_id: region.id, amount: 130 },
        ],
        rules: shippingRules,
      },
      {
        name: "Same-Day Express (Dhaka)",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Order before 2 PM for same-day delivery inside Dhaka.",
          code: "express-dhaka",
        },
        prices: [
          { currency_code: "bdt", amount: 200 },
          { region_id: region.id, amount: 200 },
        ],
        rules: shippingRules,
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [defaultSalesChannel[0].id] },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { data: existingKeys } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: { type: "publishable" },
  });

  let publishableApiKey: { id: string } | undefined = existingKeys?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          { title: "Orbis Square Storefront", type: "publishable", created_by: "" },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult;
  }

  // Bind the key to exactly one sales channel, dropping any others Medusa
  // linked during bootstrap.
  const otherChannelIds = (
    await salesChannelModuleService.listSalesChannels({})
  )
    .map((channel) => channel.id)
    .filter((id) => id !== defaultSalesChannel[0].id);

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
      remove: otherChannelIds,
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Development Boards",
          handle: "development-boards",
          description:
            "Arduino, ESP32, Raspberry Pi and other microcontroller boards.",
          is_active: true,
        },
        {
          name: "Sensors & Modules",
          handle: "sensors-modules",
          description:
            "Distance, motion, temperature, humidity and environmental sensing.",
          is_active: true,
        },
        {
          name: "Motors & Actuators",
          handle: "motors-actuators",
          description: "Servos, steppers, DC gear motors and drivers.",
          is_active: true,
        },
        {
          name: "Power & Batteries",
          handle: "power-batteries",
          description: "Li-ion cells, LiPo packs, regulators and chargers.",
          is_active: true,
        },
        {
          name: "Prototyping",
          handle: "prototyping",
          description: "Breadboards, jumper wires, headers and passives.",
          is_active: true,
        },
        {
          name: "Tools & Equipment",
          handle: "tools-equipment",
          description: "Soldering gear, multimeters and bench essentials.",
          is_active: true,
        },
      ],
    },
  });

  const category = (name: string) =>
    categoryResult.find((cat) => cat.name === name)!.id;

  // Collections drive the rails on the storefront home page.
  const { result: collectionResult } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        { title: "Best Sellers", handle: "best-sellers" },
        { title: "New Arrivals", handle: "new-arrivals" },
        { title: "Starter Kits", handle: "starter-kits" },
      ],
    },
  });

  const collection = (title: string) =>
    collectionResult.find((c) => c.title === title)!.id;

  const bestSellers = collection("Best Sellers");
  const newArrivals = collection("New Arrivals");
  const starterKits = collection("Starter Kits");

  const salesChannels = [{ id: defaultSalesChannel[0].id }];

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "First Robot Kit",
          handle: "first-robot-kit",
          collection_id: starterKits,
          category_ids: [category("Development Boards")],
          description:
            "Everything a first line-follower needs, wired on a breadboard in an afternoon.",
          metadata: {
            level: "Beginner",
            was: 2890,
            items: [
              "Arduino Uno R3 + USB cable",
              "L298N motor driver",
              "2 × TT gear motors + wheels",
              "830-point breadboard & jumpers",
            ],
          },
          weight: 900,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("kit-first-robot")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-KIT-FIRSTROBOT",
              options: { Default: "Standard" },
              prices: bdt(2450),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Sensor Bench Kit",
          handle: "sensor-bench-kit",
          collection_id: starterKits,
          category_ids: [category("Sensors & Modules")],
          description:
            "The nine modules that show up in most university project briefs, pre-tested together.",
          metadata: {
            level: "Intermediate",
            was: 3760,
            items: [
              "ESP32 DevKit V1",
              "HC-SR04 + MPU-6050 + DHT22",
              '0.96" OLED & I²C expander',
              "Breadboard, jumpers, headers",
            ],
          },
          weight: 700,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("kit-sensor-bench")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-KIT-SENSORBENCH",
              options: { Default: "Standard" },
              prices: bdt(3180),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Bench Setup Kit",
          handle: "bench-setup-kit",
          collection_id: starterKits,
          category_ids: [category("Tools & Equipment")],
          description:
            "Solder, measure, power. The bench kit we hand new interns on day one.",
          metadata: {
            level: "Workshop",
            was: 5650,
            items: [
              "60W soldering iron kit",
              "DT-830D multimeter",
              "LM2596 bench supply module",
              "Solder, flux, wick, cutters",
            ],
          },
          weight: 1800,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("kit-bench-setup")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-KIT-BENCHSETUP",
              options: { Default: "Standard" },
              prices: bdt(4900),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Arduino Uno R3 (Compatible)",
          handle: "arduino-uno-r3",
          collection_id: bestSellers,
          category_ids: [category("Development Boards")],
          description:
            "The classic ATmega328P board that starts almost every robotics project. Fully Arduino IDE compatible, with 14 digital I/O pins, 6 analog inputs and a USB-B programming interface. Ships with a USB cable.",
          weight: 60,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("arduino-uno-r3")],
          options: [{ title: "Bundle", values: ["Board only", "With USB cable"] }],
          variants: [
            {
              title: "Board only",
              sku: "OS-BRD-UNO-R3",
              options: { Bundle: "Board only" },
              prices: bdt(850),
            },
            {
              title: "With USB cable",
              sku: "OS-BRD-UNO-R3-USB",
              options: { Bundle: "With USB cable" },
              prices: bdt(950),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Arduino Nano V3 (CH340)",
          handle: "arduino-nano-v3",
          category_ids: [category("Development Boards")],
          description:
            "A breadboard-friendly Uno in miniature. Same ATmega328P, same sketch compatibility, a fraction of the footprint — ideal for permanent installs and tight robot chassis. Uses the CH340 USB driver.",
          weight: 15,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("arduino-nano-v3")],
          options: [{ title: "Headers", values: ["Soldered", "Unsoldered"] }],
          variants: [
            {
              title: "Soldered",
              sku: "OS-BRD-NANO-S",
              options: { Headers: "Soldered" },
              prices: bdt(490),
            },
            {
              title: "Unsoldered",
              sku: "OS-BRD-NANO-U",
              options: { Headers: "Unsoldered" },
              prices: bdt(450),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "ESP32 DevKit V1 (WiFi + Bluetooth)",
          handle: "esp32-devkit-v1",
          collection_id: bestSellers,
          category_ids: [category("Development Boards")],
          description:
            "Dual-core 240 MHz microcontroller with WiFi and Bluetooth built in. The default choice for IoT dashboards, remote-controlled robots and anything that needs to talk to a phone. 30-pin layout.",
          weight: 20,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("esp32-devkit-v1")],
          options: [{ title: "Variant", values: ["30-pin", "38-pin"] }],
          variants: [
            {
              title: "30-pin",
              sku: "OS-BRD-ESP32-30",
              options: { Variant: "30-pin" },
              prices: bdt(650),
            },
            {
              title: "38-pin",
              sku: "OS-BRD-ESP32-38",
              options: { Variant: "38-pin" },
              prices: bdt(720),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "NodeMCU ESP8266 V3",
          handle: "nodemcu-esp8266-v3",
          category_ids: [category("Development Boards")],
          description:
            "Affordable WiFi-enabled board for sensor nodes and home automation. Programmable straight from the Arduino IDE over micro-USB, with plenty of community libraries behind it.",
          weight: 18,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("nodemcu-esp8266-v3")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-BRD-NODEMCU",
              options: { Default: "Standard" },
              prices: bdt(420),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Raspberry Pi 4 Model B",
          handle: "raspberry-pi-4-model-b",
          collection_id: newArrivals,
          category_ids: [category("Development Boards")],
          description:
            "A full Linux computer the size of a credit card. Quad-core Cortex-A72, dual micro-HDMI, gigabit Ethernet and USB 3.0 — enough headroom for ROS, computer vision and edge inference workloads.",
          weight: 50,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("raspberry-pi-4-model-b")],
          options: [{ title: "Memory", values: ["2GB", "4GB", "8GB"] }],
          variants: [
            {
              title: "2GB",
              sku: "OS-BRD-RPI4-2GB",
              options: { Memory: "2GB" },
              prices: bdt(7200),
            },
            {
              title: "4GB",
              sku: "OS-BRD-RPI4-4GB",
              options: { Memory: "4GB" },
              prices: bdt(9500),
            },
            {
              title: "8GB",
              sku: "OS-BRD-RPI4-8GB",
              options: { Memory: "8GB" },
              prices: bdt(13500),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "HC-SR04 Ultrasonic Distance Sensor",
          handle: "hc-sr04-ultrasonic-sensor",
          collection_id: bestSellers,
          category_ids: [category("Sensors & Modules")],
          description:
            "Measures distance from 2 cm to 4 m by timing an ultrasonic pulse. The standard obstacle-avoidance sensor for line followers, parking assists and autonomous rovers.",
          weight: 10,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("hc-sr04-ultrasonic-sensor")],
          options: [{ title: "Pack size", values: ["Single", "Pack of 5"] }],
          variants: [
            {
              title: "Single",
              sku: "OS-SEN-HCSR04-1",
              options: { "Pack size": "Single" },
              prices: bdt(120),
            },
            {
              title: "Pack of 5",
              sku: "OS-SEN-HCSR04-5",
              options: { "Pack size": "Pack of 5" },
              prices: bdt(540),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "MPU-6050 6-Axis Gyro & Accelerometer",
          handle: "mpu-6050-imu",
          collection_id: newArrivals,
          category_ids: [category("Sensors & Modules")],
          description:
            "Three-axis gyroscope and three-axis accelerometer on one I²C module, with an onboard motion processor. The sensor behind self-balancing robots, drone stabilisation and gesture control.",
          weight: 8,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("mpu-6050-imu")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-SEN-MPU6050",
              options: { Default: "Standard" },
              prices: bdt(250),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "DHT22 Temperature & Humidity Sensor",
          handle: "dht22-temperature-humidity-sensor",
          category_ids: [category("Sensors & Modules")],
          description:
            "Calibrated digital readings across -40 to 80 °C and 0-100 % RH on a single data pin. More accurate and wider-range than the DHT11, and well suited to Bangladesh's humidity swings.",
          weight: 8,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("dht22-temperature-humidity-sensor")],
          options: [{ title: "Form factor", values: ["Bare sensor", "Module with PCB"] }],
          variants: [
            {
              title: "Bare sensor",
              sku: "OS-SEN-DHT22-B",
              options: { "Form factor": "Bare sensor" },
              prices: bdt(420),
            },
            {
              title: "Module with PCB",
              sku: "OS-SEN-DHT22-M",
              options: { "Form factor": "Module with PCB" },
              prices: bdt(480),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "SG90 Micro Servo 9g",
          handle: "sg90-micro-servo",
          collection_id: bestSellers,
          category_ids: [category("Motors & Actuators")],
          description:
            "Lightweight 180° hobby servo with about 1.8 kg·cm of torque. Cheap enough to use everywhere — robotic arms, pan-tilt camera mounts, sensor sweeps and school projects. Horns and screws included.",
          weight: 12,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("sg90-micro-servo")],
          options: [{ title: "Pack size", values: ["Single", "Pack of 4"] }],
          variants: [
            {
              title: "Single",
              sku: "OS-MOT-SG90-1",
              options: { "Pack size": "Single" },
              prices: bdt(180),
            },
            {
              title: "Pack of 4",
              sku: "OS-MOT-SG90-4",
              options: { "Pack size": "Pack of 4" },
              prices: bdt(660),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "MG996R High-Torque Metal Gear Servo",
          handle: "mg996r-metal-gear-servo",
          collection_id: newArrivals,
          category_ids: [category("Motors & Actuators")],
          description:
            "Metal-geared servo delivering around 11 kg·cm at 6 V. Built for robotic arm joints, steering linkages and anything the SG90 is too weak to lift.",
          weight: 55,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("mg996r-metal-gear-servo")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-MOT-MG996R",
              options: { Default: "Standard" },
              prices: bdt(550),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "NEMA 17 Stepper Motor",
          handle: "nema-17-stepper-motor",
          collection_id: newArrivals,
          category_ids: [category("Motors & Actuators")],
          description:
            "Bipolar 1.8° stepper with a 42 mm frame — the motor that drives most 3D printers and CNC builds. Precise open-loop positioning when paired with an A4988 or DRV8825 driver.",
          weight: 280,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("nema-17-stepper-motor")],
          options: [{ title: "Holding torque", values: ["40 N·cm", "59 N·cm"] }],
          variants: [
            {
              title: "40 N·cm",
              sku: "OS-MOT-NEMA17-40",
              options: { "Holding torque": "40 N·cm" },
              prices: bdt(1200),
            },
            {
              title: "59 N·cm",
              sku: "OS-MOT-NEMA17-59",
              options: { "Holding torque": "59 N·cm" },
              prices: bdt(1550),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "L298N Dual H-Bridge Motor Driver",
          handle: "l298n-motor-driver",
          collection_id: bestSellers,
          category_ids: [category("Motors & Actuators")],
          description:
            "Drives two DC motors or one stepper with direction and PWM speed control, up to 2 A per channel. The workhorse driver board for two-wheel and four-wheel robot chassis.",
          weight: 30,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("l298n-motor-driver")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-MOT-L298N",
              options: { Default: "Standard" },
              prices: bdt(180),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "A4988 Stepper Motor Driver",
          handle: "a4988-stepper-driver",
          category_ids: [category("Motors & Actuators")],
          description:
            "Microstepping driver for bipolar steppers, down to 1/16 step with an adjustable current limit. Sold with a heatsink — set the Vref before you run it hot.",
          weight: 5,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("a4988-stepper-driver")],
          options: [{ title: "Pack size", values: ["Single", "Pack of 5"] }],
          variants: [
            {
              title: "Single",
              sku: "OS-MOT-A4988-1",
              options: { "Pack size": "Single" },
              prices: bdt(150),
            },
            {
              title: "Pack of 5",
              sku: "OS-MOT-A4988-5",
              options: { "Pack size": "Pack of 5" },
              prices: bdt(680),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "18650 Li-ion Cell 2600mAh",
          handle: "18650-li-ion-cell",
          collection_id: bestSellers,
          category_ids: [category("Power & Batteries")],
          description:
            "Rechargeable 3.7 V lithium-ion cell for robot power packs and portable builds. Tested capacity, flat-top format — pair with a BMS for multi-cell packs.",
          weight: 45,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("18650-li-ion-cell")],
          options: [{ title: "Pack size", values: ["Single", "Pack of 4"] }],
          variants: [
            {
              title: "Single",
              sku: "OS-PWR-18650-1",
              options: { "Pack size": "Single" },
              prices: bdt(280),
            },
            {
              title: "Pack of 4",
              sku: "OS-PWR-18650-4",
              options: { "Pack size": "Pack of 4" },
              prices: bdt(1050),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "LiPo Battery 3S 2200mAh 30C",
          handle: "lipo-3s-2200mah",
          collection_id: newArrivals,
          category_ids: [category("Power & Batteries")],
          description:
            "11.1 V three-cell lithium-polymer pack with a 30C discharge rate — enough punch for quadcopters and high-current drive trains. XT60 connector, balance lead included.",
          weight: 190,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("lipo-3s-2200mah")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-PWR-LIPO-3S",
              options: { Default: "Standard" },
              prices: bdt(1800),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "LM2596 Adjustable Buck Converter",
          handle: "lm2596-buck-converter",
          category_ids: [category("Power & Batteries")],
          description:
            "Steps 4-35 V down to a stable 1.25-30 V at up to 2 A. Drop one between your battery pack and your logic board so a stalling motor never browns out the microcontroller.",
          weight: 12,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("lm2596-buck-converter")],
          options: [{ title: "Display", values: ["Without display", "With voltmeter"] }],
          variants: [
            {
              title: "Without display",
              sku: "OS-PWR-LM2596",
              options: { Display: "Without display" },
              prices: bdt(140),
            },
            {
              title: "With voltmeter",
              sku: "OS-PWR-LM2596-V",
              options: { Display: "With voltmeter" },
              prices: bdt(260),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Solderless Breadboard 830 Points",
          handle: "breadboard-830-points",
          collection_id: bestSellers,
          category_ids: [category("Prototyping")],
          description:
            "Full-size 830-tie breadboard with dual power rails and an adhesive back. Room for a DIP-40 chip plus support circuitry without a single solder joint.",
          weight: 90,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("breadboard-830-points")],
          options: [{ title: "Size", values: ["830 points", "400 points"] }],
          variants: [
            {
              title: "830 points",
              sku: "OS-PRO-BB-830",
              options: { Size: "830 points" },
              prices: bdt(150),
            },
            {
              title: "400 points",
              sku: "OS-PRO-BB-400",
              options: { Size: "400 points" },
              prices: bdt(95),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Jumper Wire Set (120 pcs)",
          handle: "jumper-wire-set-120",
          collection_id: bestSellers,
          category_ids: [category("Prototyping")],
          description:
            "Forty each of male-to-male, male-to-female and female-to-female ribbon jumpers, 20 cm long. The consumable you always run out of halfway through a build.",
          weight: 110,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("jumper-wire-set-120")],
          options: [{ title: "Default", values: ["120 pcs mixed"] }],
          variants: [
            {
              title: "120 pcs mixed",
              sku: "OS-PRO-JUMP-120",
              options: { Default: "120 pcs mixed" },
              prices: bdt(220),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Soldering Iron Kit 60W",
          handle: "soldering-iron-kit-60w",
          category_ids: [category("Tools & Equipment")],
          description:
            "Temperature-adjustable 60 W iron with five interchangeable tips, solder wire, a desoldering pump and a stand. Everything needed to move a project off the breadboard.",
          weight: 450,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("soldering-iron-kit-60w")],
          options: [{ title: "Default", values: ["Complete kit"] }],
          variants: [
            {
              title: "Complete kit",
              sku: "OS-TOL-SOLDER-60W",
              options: { Default: "Complete kit" },
              prices: bdt(950),
            },
          ],
          sales_channels: salesChannels,
        },
        {
          title: "Digital Multimeter DT-830D",
          handle: "digital-multimeter-dt830d",
          collection_id: newArrivals,
          category_ids: [category("Tools & Equipment")],
          description:
            "Measures DC/AC voltage, DC current, resistance and diode continuity. The first instrument every electronics bench needs, and the fastest way to find the wire you forgot to connect.",
          weight: 180,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          images: [img("digital-multimeter-dt830d")],
          options: [{ title: "Default", values: ["Standard"] }],
          variants: [
            {
              title: "Standard",
              sku: "OS-TOL-DMM-830D",
              options: { Default: "Standard" },
              prices: bdt(650),
            },
          ],
          sales_channels: salesChannels,
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    inventoryLevels.push({
      location_id: stockLocation.id,
      stocked_quantity: 500,
      inventory_item_id: inventoryItem.id,
    });
  }

  await createInventoryLevelsWorkflow(container).run({
    input: { inventory_levels: inventoryLevels },
  });

  logger.info("Finished seeding inventory levels data.");
}
