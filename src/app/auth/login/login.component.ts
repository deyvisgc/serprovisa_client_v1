import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {


  loginForm: FormGroup;
  submitted = false;
  error = '';
  successmsg = false;
  returnUrl: string;
  isLoading = false
  // set the currenr year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router,
    private authenticationService: AuthService) { }

  ngOnInit() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    }
    );
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }
  // convenience getter for easy access to form fields
  get f() { return this.loginForm; }

  /**
   * Form submit
   */
  onSubmit() {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    } else {
      this.isLoading = true
      this.authenticationService.login(this.f.controls["email"].value, this.f.controls["password"].value)
      .subscribe((res: any) => {
        console.log(res)
        // if (res.code === 200) {
          
        // }
        this.router.navigate(['system/dashboard']);
        this.isLoading = false
        }, (err: any) => {
          if (err && err.status === 400) {
            this.error = err.error.message;
          } else {
            this.error = err.status !== 500 ?  err.error.error : ""
          }
          this.submitted = false
          this.isLoading = false
        })
    }
  }
}
