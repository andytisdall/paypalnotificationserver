import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

import getSecrets from "./getSecrets";
import urls from "./urls";
import getSFToken from "./salesforce/getSFToken";
import { getZohoToken } from "./zoho/getZohoToken";

export type Service = "salesforce" | "zoho";

class fetcher {
  instance: AxiosInstance;
  service: Service | undefined;
  token: Record<Service, string | undefined>;

  constructor() {
    this.instance = axios.create();
    this.token = {
      salesforce: undefined,
      zoho: undefined,
    };
  }

  clearService() {
    this.service = undefined;
    this.instance.defaults.baseURL = undefined;
  }

  setAuth() {
    if (this.service) {
      const token = this.token[this.service];
      if (token) {
        this.instance.defaults.headers.common["Content-Type"] =
          "application/json";

        if (this.service === "salesforce") {
          this.instance.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${token}`;
        }
        if (this.service === "zoho") {
          this.instance.defaults.headers.common["Authorization"] =
            "Zoho-oauthtoken " + token;
        }
      } else {
        this.getToken();
      }
    } else {
      throw Error("No service set");
    }
  }

  async setService(service: Service) {
    if (this.service !== service) {
      this.service = service;
      const baseURL = urls[service];
      this.instance.defaults.baseURL = baseURL;
      this.setAuth();
    }
  }

  getService() {
    return this.service;
  }

  private async getToken() {
    let token: string | undefined;
    if (this.service === "salesforce") {
      token = await getSFToken();
    }

    if (this.service === "zoho") {
      if (process.env.NODE_ENV === "production") {
        token = await getZohoToken();
      } else {
        const { ZOHO_SANDBOX_TOKEN } = await getSecrets(["ZOHO_SANDBOX_TOKEN"]);
        token = ZOHO_SANDBOX_TOKEN;
      }
    }

    this.token[this.service!] = token;

    this.setAuth();
  }

  private async retryCall(callback: () => Promise<AxiosResponse<any, any>>) {
    this.token[this.service!] = undefined;
    await this.getToken();
    return await callback();
  }

  async get(url: string, options?: AxiosRequestConfig) {
    const get = async () => {
      const res = await this.instance.get(url, options);
      return res;
    };
    try {
      return await get();
    } catch (err) {
      return await this.retryCall(get);
    }
  }

  async post(
    url: string,
    body: Record<string, any> | FormData,
    options?: AxiosRequestConfig
  ) {
    const post = async () => {
      return await this.instance.post(url, body, options);
    };
    try {
      return await post();
    } catch (err) {
      return await this.retryCall(post);
    }
  }

  async patch(
    url: string,
    body: Record<string, any> | FormData,
    options?: AxiosRequestConfig
  ) {
    if (!this.service) {
      throw Error("Base url has not been set");
    }
    const patch = async () => {
      return await this.instance.patch(url, body, options);
    };
    try {
      return await patch();
    } catch (err) {
      return await this.retryCall(patch);
    }
  }

  async put(
    url: string,
    body: Record<string, any> | FormData,
    options?: AxiosRequestConfig
  ) {
    if (!this.service) {
      throw Error("Base url has not been set");
    }
    const put = async () => {
      return await this.instance.put(url, body, options);
    };
    try {
      return await put();
    } catch (err) {
      return await this.retryCall(put);
    }
  }

  async delete(url: string, options?: AxiosRequestConfig) {
    if (!this.service) {
      throw Error("Base url has not been set");
    }
    const del = async () => {
      return await this.instance.delete(url, options);
    };
    try {
      return await del();
    } catch (err) {
      return await this.retryCall(del);
    }
  }
}

export default new fetcher();
