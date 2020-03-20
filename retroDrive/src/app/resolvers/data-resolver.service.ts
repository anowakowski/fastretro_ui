
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { DataPassingService } from '../services/data-passing.service';

@Injectable({
  providedIn: 'root'
})
export class DataResolverService implements Resolve<any> {
 
  constructor(private dataService: DataPassingService) { }
 
  resolve(route: ActivatedRouteSnapshot) {
    let id = route.paramMap.get('id');
    return this.dataService.getData(id);
  }
}
