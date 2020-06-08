import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';

export interface MenuTag {
  color: string; // Background Color
  value: string;
}

export interface MenuChildrenItem {
  route: string;
  name: string;
  type: 'link' | 'sub' | 'extLink' | 'extTabLink';
  children?: MenuChildrenItem[];
}

export interface Menu {
  route: string;
  name: string;
  type: 'link' | 'sub' | 'extLink' | 'extTabLink';
  icon: string;
  label?: MenuTag;
  badge?: MenuTag;
  children?: MenuChildrenItem[];
}

@Injectable({
  providedIn: 'root',
})
export class MenuService {
  private menu: BehaviorSubject<Menu[]> = new BehaviorSubject<Menu[]>([]);

  getAll(): Observable<Menu[]> {
    return this.menu.asObservable();
  }

  set(menu: Menu[]): Observable<Menu[]> {
    this.menu.next(menu);
    return this.menu.asObservable();
  }

  add(menu: Menu) {
    const tmpMenu = this.menu.value;
    tmpMenu.push(menu);
    this.menu.next(tmpMenu);
  }

  reset() {
    this.menu.next([]);
  }

  getMenuItemName(routeArr: string[]): string {
    return this.getMenuLevel(routeArr)[routeArr.length - 1];
  }

  // TODO:
  //// -added
  private  _isLeafItem(item:MenuChildrenItem):boolean {
    //// if a menuItem is leaf
    const cond0 = (item.route === undefined);
    const cond1 = (item.children === undefined);
    const cond2 = (!cond1 && item.children.length ===0);
    return(cond0 || cond1 || cond2);
  }
  private _deepcopyJsonObj(jobj:any):any {
    //// deepcop object-could-be-jsonized
    return(JSON.parse(JSON.stringify(jobj)));
  }
  private _jsonObjEqual(jobj0:any,jobj1:any):boolean {
    //// if two objects-could-be-jsonized equal
    const cond = (JSON.stringify(jobj0) === JSON.stringify(jobj1));
    return(cond);
  }

  private _routeEqual(routeArr:Array<string>,realRouteArr:Array<string>):boolean {
    //// if routeArr equals realRouteArr(after remove empty-route-element)
    realRouteArr = this._deepcopyJsonObj(realRouteArr);
    realRouteArr = realRouteArr.filter(r=>(r!==''));
    return(this._jsonObjEqual(routeArr,realRouteArr));
  }

  getMenuLevel(routeArr: string[]): string[] {
    let tmpArr = [];
    this.menu.value.forEach(item => {
      //// breadth-first-traverse -modified
      let unhandledLayer = [
        {item,parentNamePathList:[],realRouteArr:[]}
      ];
      while(unhandledLayer.length>0) {
          let nextUnhandledLayer = [];
          for(const ele of unhandledLayer) {
              const eachItem = ele.item;
              const currentNamePathList = this._deepcopyJsonObj(ele.parentNamePathList).concat(eachItem.name);
              const currentRealRouteArr =  this._deepcopyJsonObj(ele.realRouteArr).concat(eachItem.route);
              //// compare the full Array
              //// for expandable
              const cond = this._routeEqual(routeArr,currentRealRouteArr);
              if(cond) {
                  tmpArr = currentNamePathList;
                  break;
              } else {
              }
              ////
              const isLeafCond = this._isLeafItem(eachItem);
              if(isLeafCond) {
              } else {
                  const children = eachItem.children;
                  const wrappedChildren = children.map(
                      child=>(
                        {
                          item:child,
                          parentNamePathList:currentNamePathList,
                          realRouteArr:currentRealRouteArr
                        }
                      )
                  );
                  nextUnhandledLayer = nextUnhandledLayer.concat(wrappedChildren);
              }
          }
          unhandledLayer = nextUnhandledLayer;
      }
      /* -deleted
      if (item.route === routeArr[0]) {
        tmpArr.push(item.name);
        // Level1
        if (item.children && item.children.length) {
          item.children.forEach(itemlvl1 => {
            if (routeArr[1] && itemlvl1.route === routeArr[1]) {
              tmpArr.push(itemlvl1.name);
              // Level2
              if (itemlvl1.children && itemlvl1.children.length) {
                itemlvl1.children.forEach(itemlvl2 => {
                  if (routeArr[2] && itemlvl2.route === routeArr[2]) {
                    tmpArr.push(itemlvl2.name);
                  }
                });
              }
            } else if (routeArr[1]) {
              // Level2
              if (itemlvl1.children && itemlvl1.children.length) {
                itemlvl1.children.forEach(itemlvl2 => {
                  if (itemlvl2.route === routeArr[1]) {
                    tmpArr.push(itemlvl1.name, itemlvl2.name);
                  }
                });
              }
            }
          });
        }
      }
      */
    });
    return tmpArr;
  }

  recursMenuForTranslation(menu: Menu[] | MenuChildrenItem[], namespace: string) {
    menu.forEach(menuItem => {
      menuItem.name = `${namespace}.${menuItem.name}`;
      if (menuItem.children && menuItem.children.length > 0) {
        this.recursMenuForTranslation(menuItem.children, menuItem.name);
      }
    });
  }
}
