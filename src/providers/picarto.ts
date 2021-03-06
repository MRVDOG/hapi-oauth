import * as Wreck from 'wreck';
import * as qs from 'querystring';
import fetch from 'node-fetch';

import { Provider, Scopes, AccessTokens } from '../provider';
import { Profile } from '../profile';

export class PicartoProfile implements Profile {
    public channel_details: {
        user_id: number;
        name: string;
        online: boolean;
        viewers: number;
        viewers_total: number;
        followers: number;
        adult: boolean;
        category: string;
        account_type: string;
        commissions: boolean;
        title: string;
        description_panels: any[];
        private: boolean;
        gaming: boolean;
        guest_chat: boolean;
        last_live: string;
        tags: string[];
        multistream: any[];
    };
    public email: string;
    public creation_date: string;
    public private_key: string;
    public following: {
        user_id: number;
        name: string;
    }[];
    public subscriptions: {
        user_id: number;
        name: string;
    }[];

    constructor(profile: any) {
        Object.assign(this, profile);
    }

    public getUniqueId() {
        return this.channel_details.user_id;
    }
}

export class PicartoProvider extends Provider {
    public name = 'picarto';
    public tokenUrl = 'https://oauth.picarto.tv/token';
    public authUrl = 'https://oauth.picarto.tv/authorize';
    public profileUrl = 'https://api.picarto.tv/v1/user';

    constructor(
        public clientId: string,
        public clientSecret: string,
        public scopes: Scopes,
    ) {
        super();
    }

    requestToken(code: string, redirect_uri: string) {
        return new Promise((resolve, reject) => {
            const query = {
                code,
                redirect_uri,
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'authorization_code',
            };
            Wreck.post(
                `${this.tokenUrl}?${qs.stringify(query)}`,
                {
                    json: true,
                },
                (err, message, res) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    if (res.error) {
                        const error = new Error(res.error_description);
                        error.name = err.error;
                        reject(error);
                        return;
                    }

                    resolve(res);
                },
            );
        });
    }

    public getProfile(tokens: AccessTokens): Promise<PicartoProfile> {
        return fetch(this.profileUrl, {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
            },
        })
            .then(res => res.json())
            .then(profile => new PicartoProfile(profile));
    }
}
