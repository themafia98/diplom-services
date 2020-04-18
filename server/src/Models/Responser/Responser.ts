import { ResponseBuilder } from '../../Utils/Interfaces';
import { Params } from '../../Utils/Interfaces';
import Database from '../Database';
import { Response, Request } from 'express';
import { ParserResult } from '../../Utils/Types';
import Utils from '../../Utils';

const { getResponseJson } = Utils;

class Responser implements ResponseBuilder {
  private response: Response;
  private request: Request;
  private paramsList: Params;
  private error: Error | null;
  private statusResponse: number;
  private data: ParserResult;
  private db: Readonly<Database.ManagmentDatabase> | null;

  constructor(
    res: Response,
    req: Request,
    params: Params,
    err: Error | null,
    status: number = 200,
    metadata: ParserResult = null,
    dbm: Readonly<Database.ManagmentDatabase> | null = null,
  ) {
    this.response = res;
    this.request = req;
    this.paramsList = params;
    this.error = err;
    this.statusResponse = status;
    this.data = metadata;
    this.db = dbm;
  }

  get res(): Response {
    return this.response;
  }

  get req(): Request {
    return this.request;
  }

  get params(): Params {
    return this.paramsList;
  }

  get err(): Error | null {
    return this.error;
  }

  get status(): number {
    return this.statusResponse;
  }

  get metadata(): ParserResult {
    return this.data;
  }

  get dbm(): Readonly<Database.ManagmentDatabase> | null {
    return this.db;
  }

  async emit(): Promise<Response> {
    if (this.res.headersSent) return this.res;
    if (this.status) this.res.status(this.status);
    if (this.dbm) await this.dbm.disconnect().catch((err: Error) => console.error(err));

    switch (this.status) {
      case 200:
        return this.res.json(
          getResponseJson(
            this.params?.methodQuery,
            { params: this.params, metadata: this.metadata, done: true, status: 'OK' },
            (<Record<string, any>>this.req).start,
          ),
        );
      case 503:
        return this.res.json(
          getResponseJson(
            (<Error>this.err)?.name,
            { metadata: 'Server error', params: this.params, done: false, status: 'FAIL' },
            (this.req as Record<string, any>).start,
          ),
        );
      default:
        return this.res.json(
          getResponseJson(
            `error or status not connected to responser, ${this.params?.methodQuery}`,
            { status: this.params?.status, params: this.params, done: false, metadata: this.metadata },
            (this.req as Record<string, any>).start,
          ),
        );
    }
  }
}

export default Responser;