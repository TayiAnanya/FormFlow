import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Password } from 'primeng/password';

import { AuthenticationService } from '../../services/authentication.service';
import { resolvePostAuthUrl } from '../../utils/resolve-post-auth-url';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, Button, InputText, Password, Message],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthenticationService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected errorMessage: string | null = null;
  protected submitted = false;

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected onSubmit(): void {
    this.submitted = true;
    this.errorMessage = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const result = this.auth.login(this.form.getRawValue());
    if (!result.success) {
      this.errorMessage = result.errorMessage ?? 'Invalid email or password.';
      return;
    }

    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigateByUrl(resolvePostAuthUrl(returnUrl));
  }
}
