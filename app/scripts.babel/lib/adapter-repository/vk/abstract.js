import {AbstractAdapterRepository} from '../abstract';

export class AbstractVkAdapterRepository extends AbstractAdapterRepository {
  get locations() {
    return ['^vk\.com']
  }
}