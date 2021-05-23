import axios from 'axios';
import { Alert } from 'domain/alerts';

type Response = { data: Alert[] };

export class AlertsService {
  async getAll() {
    const result = await axios.get<Response>(`/api/alerts`);
    return result.data.data;
  }
}
