/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthUtils } from 'app/core/auth/auth.utils';
import { UserService } from 'app/core/user/user.service';
import { environment } from 'environments/environment';
import { ThrowStmt } from '@angular/compiler';

const httpOptions = {
    headers: new HttpHeaders({
      'Content-Type':  'application/json',
      'Cache-Control': 'no-cache'
    })
};

@Injectable()
export class AuthService
{
    private _authenticated: boolean = false;

    /**
     * Constructor
     */
    constructor(
        private _httpClient: HttpClient,
        private _userService: UserService
    )
    {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Setter & getter for access token
     */
    set accessToken(token: string)
    {
        localStorage.setItem('accessToken', token);
    }

    get accessToken(): string
    {
        return localStorage.getItem('accessToken') ?? '';
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Forgot password
     *
     * @param email
     */
    forgotPassword(email: string): Observable<any>
    {
        return this._httpClient.post('api/auth/forgot-password', email);
    }

    /**
     * Reset password
     *
     * @param password
     */
    resetPassword(password: string): Observable<any>
    {
        return this._httpClient.post('api/auth/reset-password', password);
    }

    /**
     * Sign in
     *
     * @param credentials
     */
    signIn(credentials: { email: string; password: string }): Observable<any>
    {
        // Throw error, if the user is already logged in
        if ( this._authenticated )
        {
            return throwError('User is already logged in.');
        }

        return this._httpClient.post(environment.apiUrl + 'supra-auth/Authentication/Login', {
            DadosLogin: {
                Usuario: credentials.email,
                Senha: credentials.password,
            }
        }, httpOptions).pipe(
            switchMap((response: any) => {
                // Store the access token in the local storage
                this.accessToken = response.Data.Token;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return a new observable with the response
                return of(response);
            })
        );
    }

    /**
     * Sign in using the access token
     */
    signInUsingToken(): Observable<any>
    {
        // eslint-disable-next-line max-len
        // this.accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVSUQiOjMzODA3MzY0ODgxMjg5MDUyMTcsImlzcyI6InRocmVhZHVzZXIxQGVtcHJlc2EuY29tLmJyIiwiZXhwIjoxNjA2OTE0MDQzfQ.YsGw3-iIFoaEvguvR9F1MJNf3XxPU8uEn0KTW0vicZE';
        // this._authenticated = true;
        // return of(true);

        // Renew token
        return this._httpClient.post(environment.apiUrl + 'supra-auth/Authentication/LoginComToken', {
            DadosLogin: {
                Token: this.accessToken
            }
        }, httpOptions).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => {

                // Store the access token in the local storage
                this.accessToken = response.Data.Token;

                // Set the authenticated flag to true
                this._authenticated = true;

                // Store the user on the user service
                this._userService.user = response.user;

                // Return true
                return of(true);
            })
        );
    }

    /**
     * Sign out
     */
    signOut(): Observable<any>
    {
        // Remove the access token from the local storage
        localStorage.removeItem('accessToken');

        // Set the authenticated flag to false
        this._authenticated = false;

        // Return the observable
        return of(true);
    }

    /**
     * Sign up
     *
     * @param user
     */
    signUp(user: { name: string; email: string; password: string; company: string; country: string; phone: string }): Observable<any>
    {
        return this._httpClient.post(environment.apiUrl + 'supra-auth/Registros/RegistrarConta', {
            Registro: {
                // UID: 0,
                Nome: user.name,
                Email: user.email,
                Senha: user.password,
                Telefone: user.country + ' ' + user.phone,
            }
        }, httpOptions).pipe(
            catchError(() =>

                // Return false
                of(false)
            ),
            switchMap((response: any) => response.Result.Code === 0 ? of(true) : of(false))
        );
    }

    /**
     * Unlock session
     *
     * @param credentials
     */
    unlockSession(credentials: { email: string; password: string }): Observable<any>
    {
        return this._httpClient.post('api/auth/unlock-session', credentials);
    }

    /**
     * Check the authentication status
     */
    check(): Observable<boolean>
    {
        // return of(true);

        // Check if the user is logged in
        if ( this._authenticated )
        {
            return of(true);
        }

        // Check the access token availability
        if ( !this.accessToken )
        {
            return of(false);
        }

        // Check the access token expire date
        if ( AuthUtils.isTokenExpired(this.accessToken) )
        {
            return of(false);
        }

        // If the access token exists and it didn't expire, sign in using it
        return this.signInUsingToken();
    }
}
