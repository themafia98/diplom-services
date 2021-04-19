import { RequestWithParams, ResponseBuilder } from '../../Utils/Interfaces/Interfaces.global';
import { Params, Request as RequestCustom } from '../../Utils/Interfaces/Interfaces.global';
import { Response, Request } from 'express';
import { ParserResult } from '../../Utils/Types/types.global';
import { getResponseJson } from '../../Utils/utils.global';
import { loggerError } from '../../Utils/Logger/Logger';

class Responser implements ResponseBuilder {
  private readonly response: Response;

  private readonly request: RequestCustom;

  private readonly paramsList: Params;

  private readonly error: Error | null;

  private readonly statusResponse: number;

  private readonly data: ParserResult;

  constructor(
    res: Response,
    req: Request,
    params: Params,
    err: Error | null,
    status = 200,
    metadata: ParserResult = null,
  ) {
    this.response = res;
    this.request = req as RequestCustom;
    this.paramsList = params;
    this.error = err;
    this.statusResponse = status;
    this.data = metadata;
  }

  public get res(): Response {
    return this.response;
  }

  public get req(): RequestCustom {
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

  private getErrorStatus(): string {
    if (this.status === 404) return 'Not found';
    return `error or status not connected to responser, ${this.params.methodQuery}`;
  }

  private async doneResponse(): Promise<Response> {
    const { availableActions = null } = this.req as RequestWithParams;

    return this.res.json(
      getResponseJson(
        this.params.methodQuery,
        { params: this.params, metadata: this.metadata, done: true, status: 'done' },
        (this.req as any).start,
        this.req.method !== 'GET' ? availableActions : null,
      ),
    );
  }

  private async serverErrorResponse(): Promise<Response> {
    const { availableActions = null } = this.req as RequestWithParams;
    loggerError(JSON.stringify(this.err));

    return this.res.json(
      getResponseJson(
        (this.err as Error).name,
        { metadata: 'Server error', params: this.params, done: false, status: 'FAIL' },
        (this.req as Record<string, any>).start,
        this.req.method !== 'GET' ? availableActions : null,
      ),
    );
  }

  private async errorResponse(): Promise<Response> {
    const { availableActions = null } = this.req as RequestWithParams;

    const status: string = this.getErrorStatus();
    return this.res.json(
      getResponseJson(
        status,
        { status: this.params.status, params: this.params, done: false, metadata: this.metadata },
        (this.req as Record<string, any>).start,
        this.req.method !== 'GET' ? availableActions : null,
      ),
    );
  }

  public async sendMessage(): Promise<Response> {
    if (this.res.headersSent) return this.res;
    if (this.status) this.res.status(this.status);

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
