import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

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
    this.token = {
      salesforce: undefined,
      docusign: undefined,
    };
  }

  async setService(service: Service) {
    if (this.service !== service) {
      this.service = service;
      let baseURL = urls[service];
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

  private async retryCall(callback: () => Promise<AxiosResponse<any, any>>) {
    this.token[this.service!] = undefined;
    await this.getToken();
    return callback();
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
    const get = () => {
      const res = this.instance.get(url, options);
      return res;
    };
    try {
      return get();
    } catch (err) {
      return this.retryCall(get);
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
    const post = () => {
      const res = this.instance.post(url, body, options);
      return res;
    };
    try {
      return post();
    } catch (err) {
      return this.retryCall(post);
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
    const patch = () => {
      const res = this.instance.patch(url, body, options);
      return res;
    };
    try {
      return patch();
    } catch (err) {
      return this.retryCall(patch);
    }
  }

  async delete(url: string, options?: AxiosRequestConfig) {
    if (!this.service) {
      throw Error('Base url has not been set');
    }
    const del = async () => {
      const res = await this.instance.delete(url, options);
      return res;
    };
    try {
      return del();
    } catch (err) {
      return this.retryCall(del);
    }
  }
}

export default new fetcher();
