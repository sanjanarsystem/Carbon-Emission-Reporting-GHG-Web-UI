import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly storageKey = 'user_roles';
  private rolesSubject = new BehaviorSubject<string[]>(this.loadRoles());
  roles$ = this.rolesSubject.asObservable();

  private loadRoles(): string[] {
    try {
      const stored = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
      return Array.isArray(stored) ? stored : [];
    } catch {
      return [];
    }
  }

  setRoles(roles: string[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(roles));
    this.rolesSubject.next(roles);
  }

  getRoles(): string[] {
    return this.rolesSubject.value;
  }

  hasRole(roleToCheck: string): boolean {
    const lowerCheck = roleToCheck.toLowerCase();
    return this.getRoles().some(role => role.toLowerCase() === lowerCheck);
  }
}
