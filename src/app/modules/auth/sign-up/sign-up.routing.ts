import { Route } from '@angular/router';
import { AuthSignUpComponent } from 'app/modules/auth/sign-up/sign-up.component';
import { ContactsCountriesResolver, ContactsResolver } from 'app/modules/admin/apps/contacts/contacts.resolvers';

export const authSignupRoutes: Route[] = [
    {
        path     : '',
        component: AuthSignUpComponent,
        resolve  : {
            tasks    : ContactsResolver,
            countries: ContactsCountriesResolver
        },
    }
];
