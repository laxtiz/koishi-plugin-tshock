import { Context, Schema } from "koishi";

export const name = "tshock";

export interface Config {
  server: string;
}

export const Config: Schema<Config> = Schema.object({
  server: Schema.string()
    .default("http://localhost:7878")
}).i18n({
  "zh-CN": require("./locales/zh-CN")._config,
  "en-US": require("./locales/en-US")._config,
});

type ServerStatus = {
  status: string;
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

export function apply(ctx: Context, config: Config) {
  // write your plugin here
  ctx.i18n.define("zh-CN", require("./locales/zh-CN"));
  ctx.i18n.define("en-US", require("./locales/en-US"));

  ctx.command("tshock").action(async ({ session }) => {
    let url = config.server + "/v2/server/status?players=true";

    try {
      let status = await ctx.http.get<ServerStatus>(url);
      return session.text("tshock.status", status);
    } catch (error) {
      return session.text("tshock.error");
    }
  });
}
