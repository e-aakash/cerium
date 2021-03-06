import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { IForm, IPage, IFormResponse, IWidget } from '../interfaces';
import { trigger, transition, style, animate } from '@angular/animations';
import { DataService } from '../data.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '1' })),
      ]),
    ]),
  ],
})
export class FormComponent implements OnInit {

  id: string;
  pagen: number;
  form: IForm;
  page: IPage;
  submitted = false;
  submission = '';
  getError = null;
  loginRequired = null;

  constructor(
    private route: ActivatedRoute,
    public http: HttpClient,
    public router: Router,
    public dataService: DataService,
  ) { }

  getRouterParams() {
    this.id = this.route.snapshot.params.id;
    this.pagen = Number(this.route.snapshot.params.page);
  }

  ngOnInit() {
    this.getRouterParams();

    // Reset to first page
    if (this.pagen !== 0) {
      this.router.navigate(['/m/', this.id, 0]);

      if (this.pagen === undefined || isNaN(this.pagen)) {
        return;
      } else {
        this.pagen = 0;
      }
    }

    // Get the form
    this.http.get(`api/form/${this.id}`).subscribe((form: IForm) => {
      this.form = form;
      this.page = this.form.pages[this.pagen];

      // Page change events
      this.router.events.subscribe(val => {
        if (val instanceof NavigationEnd) {
          this.getRouterParams();
          this.page = this.form.pages[this.pagen];
        }
      });
    }, err => {
      if (err.status ===  401){
        this.loginRequired = {}
      } else {
        this.getError = {}
        this.getError.message = err.error.message;
        this.getError.status = err.status;
      }
    });
  }

  consructResponse(id: string, form: IForm): IFormResponse {
    const r = {} as IFormResponse;
    r.form_id = id;
    r.responses = {};

    const arrays = form.pages.map(p => p.widgets);
    const widgets: IWidget[] = [].concat.apply([], arrays);

    widgets.forEach(w => {
      r.responses[w.uid] = w.props.response;
    });

    return r;
  }

  submit() {
    const response = this.consructResponse(this.id, this.form);
    this.submitted = true;
    this.http.post(`api/response/${this.id}`, response).subscribe((r: any) => {
      this.submission = r.id;
      this.form = null;
    }, (e) => {
      alert(e.message);
      console.error(e);
      this.submitted = false;
    });
  }

  canSectionSubmit() {
    return Number(this.pagen) === Number(this.form.pages.length - 1);
  }

  nextPage() {
    return ['/m', this.id, Number(this.pagen) + 1];
  }

  isValidated(): boolean {
    return this.page.widgets.every(m => m.props.validated);
  }

}
