import { ResponseBuilder } from '../../Utils/Interfaces';
import { Params } from '../../Utils/Interfaces';
import Database from '../Database';
import { Response, Request } from 'express';
import { ParserResult } from '../../Utils/Types';
import Utils from '../../Utils';

const { getResponseJson } = Utils;

class Responser implements ResponseBuilder {
  private readonly response: Response;
  private readonly request: Request;
  private readonly paramsList: Params;
  private readonly error: Error | null;
  private readonly statusResponse: number;
  private readonly data: ParserResult;
  private readonly db: Readonly<Database.ManagmentDatabase> | null;

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

  public get res(): Response {
    return this.response;
  }

  public get req(): Request {
    return this.request;
  }

  public get params(): Params {
    return this.paramsList;
  }

  public get err(): Error | null {
    return this.error;
  }

  public get status(): number {
    return this.statusResponse;
  }

  public get metadata(): ParserResult {
    return this.data;
  }

  public get dbm(): Readonly<Database.ManagmentDatabase> | null {
    return this.db;
  }

  private getErrorStatus(): string {
    if (this.status === 404) return 'Not found';
    else return `error or status not connected to responser, ${this.params?.methodQuery}`;
  }

  private async doneResponse(): Promise<Response> {
    return this.res.json(
      getResponseJson(
        this.params?.methodQuery,
        { params: this.params, metadata: this.metadata, done: true, status: 'OK' },
        (<Record<string, any>>this.req).start,
      ),
    );
  }

  private async serverErrorResponse(): Promise<Response> {
    return this.res.json(
      getResponseJson(
        (<Error>this.err)?.name,
        { metadata: 'Server error', params: this.params, done: false, status: 'FAIL' },
        (this.req as Record<string, any>).start,
      ),
    );
  }

  private async errorResponse(): Promise<Response> {
    const status: string = this.getErrorStatus();
    return this.res.json(
      getResponseJson(
        status,
        { status: this.params?.status, params: this.params, done: false, metadata: this.metadata },
        (this.req as Record<string, any>).start,
      ),
    );
  }

  public async emit(): Promise<Response> {
    if (this.res.headersSent) return this.res;
    if (this.status) this.res.status(this.status);
    if (this.dbm) await this.dbm.disconnect().catch((err: Error) => console.error(err));

    switch (this.status) {
      case 200:
        return this.doneResponse();
      case 503:
        return this.serverErrorResponse();
      default:
        return this.errorResponse();
    }
  }
}

export default Responser;
