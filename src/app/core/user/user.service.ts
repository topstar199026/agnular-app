/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'app/core/user/user.model';
import { environment } from 'environments/environment';

const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Cache-Control': 'no-cache'
    })
};

@Injectable({
    providedIn: 'root'
})
export class UserService
{
    private _user: ReplaySubject<User> = new ReplaySubject<User>(1);

    /**
     * Constructor
     */
    constructor(private _httpClient: HttpClient)
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for user
     *
     * @param value
     */
    set user(value: User)
    {
        // Store the value
        this._user.next(value);
    }

    get user$(): Observable<User>
    {
        return this._user.asObservable();
    }


    get userDetail$(): Observable<any>
    {
        return this._httpClient.get<any>(environment.apiUrl + 'supra-admin/Usuarios/RecuperarUsuario?LogonEmail=threaduser1@empresa.com.br').pipe(
            map((response) => {
                // Execute the observable
                this._user.next(response);
            })
        );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Update the user
     *
     * @param user
     */
    update(user: User): Observable<any>
    {
        return this._httpClient.patch<User>('api/common/user', {user}).pipe(
            map((response) => {
                // Execute the observable
                this._user.next(response);
            })
        );
    }
}
