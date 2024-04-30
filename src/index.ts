import { Context, Dict, Schema } from "koishi";

import zhCN from "./locales/zh-CN.yml";
import enUS from "./locales/en-US.yml";

export const name = "tshock";

export interface Config {
  server: string;
  token: string;
}

export const Config: Schema<Config> = Schema.object({
  server: Schema.string().default("http://localhost:7878"),
  token: Schema.string(),
}).i18n({
  "zh-CN": require("./locales/zh-CN")._config,
  "en-US": require("./locales/en-US")._config,
});

type BaseResponse = {
  status: "200";
};

type ServerStatus = BaseResponse & {
  name: string;
  serverversion: string;
  tshockversion: string;
  port: number;
  playercount: number;
  maxplayers: number;
  world: string;
  uptime: string;
  serverpassword: boolean;
  players: {
    nickname: string;
    username: string;
    group: string;
    active: boolean;
    state: number;
    team: number;
  }[];
};

export async function apply(ctx: Context, config: Config) {
  // write your plugin here
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));
  ctx.i18n.define("en-US", require("./locales/en-US"));
  const logger = ctx.logger("tshock");

  async function request<T>(endpoint: string, params?: Dict<any>): Promise<T> {
    let url = config.server + endpoint;
    let resp = await ctx.http.get<T>(url, {
      method: "GET",
      params: {
        token: config.token,
        ...params,
      },
    });
    return resp;
  }

  ctx
    .command("tshock")
    .alias("tr")
    .action(async ({ session }) => {
      const endpoint = "/v2/server/status";

      try {
        let status = (await request(endpoint, {
          players: true,
        })) as ServerStatus;
        return session.text(".response", status);
      } catch (error) {
        return session.text("commands.tshock.messages.error");
      }
    });

  if (!config.token) return;

  ctx
    .command("tshock.cmd <cmd:rawtext>", { authority: 3 })
    .action(async ({ session }, cmd) => {
      if (!cmd) return session.text("commands.tshock.cmd.examples");
      const endpoint = "/v3/server/rawcmd";

      try {
        if (!cmd.startsWith("/")) cmd = "/" + cmd;
        const response = (await request(endpoint, { cmd })) as {
          response: string[];
        };
        return session.text(".response", response);
      } catch (error) {
        return session.text("commands.tshock.messages.error");
      }
    });

  ctx
    .command("tshock.say <message:rawtext>", { authority: 3 })
    .action(async ({ session }, message) => {
      if (!message) return session.text("commands.tshock.broadcast.examples");
      const endpoint = "/v2/server/broadcast";
      const msg = `[c/FF8000:QQ群] ${session.username}: ${message}`;
      try {
        const response = (await request(endpoint, { msg })) as {
          response: string[];
        };
        return session.text(".response");
      } catch (error) {
        return session.text("commands.tshock.messages.error");
      }
    });
}
