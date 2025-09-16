import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  email = '';
  password = '';
  constructor(private auth: AuthService, private router: Router) {}
  async login() {
    const { error } = await this.auth.login(this.email, this.password);
    if (!error) {
      this.router.navigateByUrl('/tabs', { replaceUrl: true });
    } else {
      alert('Error al iniciar sesión');
    }
  }
}

