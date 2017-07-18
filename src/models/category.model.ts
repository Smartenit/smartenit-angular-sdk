import { Model } from "../common/model";
import { CategoriesService } from "../resources/categories.service";

export class CategoryModel extends Model {
  constructor(protected categoriesService: CategoriesService, data: any) {
    super(categoriesService, data);
  }
}