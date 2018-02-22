import * as Hapi from "hapi";

import { OAuthHandler } from "./handler";
import { Provider, registerProvider } from "./provider";

export interface PluginOptions {
    // onLink: (err: any, payload: any, request: Hapi.Request, reply: Hapi.IReply) => void;
    providers: Provider[];
    baseUrl?: string;
    handler?: OAuthHandler;
    requestConfig?: Hapi.RouteOptions;
    linkConfig?: Hapi.RouteOptions;
}

export const plugin: Hapi.Plugin<PluginOptions> = {
    name: "hapi-oauth",
    version: "1.0.0",
    async register(server, options) {
        if (!options.providers) {
            throw new Error("Providers array not supplied");
        }

        options.baseUrl = options.baseUrl || server.info.uri;
        options.handler = options.handler || new OAuthHandler();

        options.providers.forEach(provider => {
            registerProvider(server, options, provider);
        });
    },
};
