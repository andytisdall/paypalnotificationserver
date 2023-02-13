import axios, { AxiosInstance } from 'axios';

import urls from './urls';
import getDSJWT from './docusign/getDSJWT';
import getSFToken from './salesforce/getSFToken';

type Service = 'salesforce' | 'docusign';

class fetcher {
  instance: AxiosInstance;
  service: string | undefined;
  token: string | undefined;
  tokenExpiration: Date | undefined;

  constructor() {
    this.instance = axios.create();
  }

  async setService(service: Service) {
    if (this.service !== service) {
      this.service = service;
      const baseURL = urls[service];
      this.instance.defaults.baseURL = baseURL;
      this.token = undefined;
    }
    await this.getToken();
  }

  getService() {
    return this.service;
  }

  private async getToken() {
    if (!this.token) {
      let token: string | undefined;
      if (this.service === 'salesforce') {
        token = await getSFToken();
      }
      if (this.service === 'docusign') {
        token = await getDSJWT();
      }
      if (!token) {
        throw Error('No token fetcher defined for this service');
      }
      this.instance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${token}`;
      this.instance.defaults.headers.common['Content-Type'] =
        'application/json';
      this.token = token;
    }
  }
}

export default new fetcher();
