import { Model } from "../common/model";
import { MetricsService } from "../resources/metrics.service";

export class MetricModel extends Model {
  get resource(): string {
    return this._data.resource;
  }

  get resourceId(): string {
    return this._data.resourceId;
  }

  get createdAt(): any {
    return this._data.createdAt;
  }

  get value(): string {
    return this._data.value && this._data.value.value;
  }

  constructor(
    protected metricsService: MetricsService, data: any
  ) {
    super(metricsService, data);
  }
}
