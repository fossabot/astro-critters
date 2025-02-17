import fs from "fs";
import type { AstroIntegration } from "astro";
import Critters from "critters";
import Options from "./options";

export default function createPlugin(
	integrationOptions: Options = {}
): AstroIntegration {


	const defaultOptions: Options = {
		path: "./dist/",
		preload: "body",
		inlineFonts: true,
		compress: true,
	};

	const options = Object.assign(defaultOptions, integrationOptions || {});

	options.path = options.path?.endsWith("/")
		? options.path
		: `${options.path}/`;

	const critters = new Critters(options);

	return {
		name: "astro-critters",
		hooks: {
			"astro:build:done": async ({ pages }) => {
				const files = pages.map((page) => {
					const pathname = page.pathname.endsWith("/")
						? page.pathname
						: page.pathname + "/";

					const file =
						pathname === "404/"
							? "404.html"
							: `${pathname}index.html`;

					return options.path + file;
				});

				for (const file of files) {
					const html = await critters.readFile(file);
					const inlined = await critters.process(html);
					await fs.promises.writeFile(file, inlined, "utf-8");
				}
			},
		},
	};
}
