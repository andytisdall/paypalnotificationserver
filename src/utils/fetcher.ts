import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

import urls from './urls';
import getDSJWT from '../docusign/getDSJWT';
import getSFToken from './salesforce/getSFToken';

type Service = 'salesforce' | 'docusign';

class fetcher {
  instance: AxiosInstance;
  service: Service | undefined;
  token: Record<Service, string | undefined>;

  constructor() {
    this.instance = axios.create();
    this.token = { salesforce: undefined, docusign: undefined };
  }

  async setService(service: Service) {
    if (this.service !== service) {
      this.service = service;
      const baseURL = urls[service];
      this.instance.defaults.baseURL = baseURL;
      const token = this.token[this.service];
      if (token) {
        this.instance.defaults.headers.common[
          'Authorization'
        ] = `Bearer ${token}`;
      } else {
        await this.getToken();
      }
    }
  }

  getService() {
    return this.service;
  }

  private async getToken() {
    let token: string | undefined;
    if (this.service === 'salesforce') {
      token = await getSFToken();
    }
    if (this.service === 'docusign') {
      token = await getDSJWT();
    }
    if (!token) {
      throw Error('Could not get token');
    }
    this.instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    this.instance.defaults.headers.common['Content-Type'] = 'application/json';
    this.token[this.service!] = token;
  }

  async get(url: string, options?: AxiosRequestConfig) {
    if (!this.service) {
      throw Error('Base url has not been set');
    }
    try {
      const res = await this.instance.get(url, options);
      return res;
    } catch (err) {
      this.token[this.service] = undefined;
      await this.getToken();
      const res = await this.instance.get(url, options);
      return res;
    }
  }

  async post(
    url: string,
    body: Record<string, any> | FormData,
    options?: AxiosRequestConfig
  ) {
    if (!this.service) {
      throw Error('Base url has not been set');
    }
    try {
      const res = await this.instance.post(url, body, options);
      return res;
    } catch (err) {
      this.token[this.service] = undefined;
      await this.getToken();
      const res = await this.instance.post(url, body, options);
      return res;
    }
  }

  async patch(
    url: string,
    body: Record<string, any> | FormData,
    options?: AxiosRequestConfig
  ) {
    if (!this.service) {
      throw Error('Base url has not been set');
    }
    try {
      const res = await this.instance.patch(url, body, options);
      return res;
    } catch (err) {
      this.token[this.service] = undefined;
      await this.getToken();
      const res = await this.instance.patch(url, body, options);
      return res;
    }
  }

  async delete(url: string, options?: AxiosRequestConfig) {
    if (!this.service) {
      throw Error('Base url has not been set');
    }
    try {
      const res = await this.instance.delete(url, options);
      return res;
    } catch (err) {
      this.token[this.service] = undefined;
      await this.getToken();
      const res = await this.instance.delete(url, options);
      return res;
    }
  }
}

export default new fetcher();
