import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderComponent } from '@shared/header/header';

@Component({
  selector: 'app-hero-pro',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, HeaderComponent],
  templateUrl: './hero-full.html',
  styleUrls: ['./hero-full.scss']
})
export class HeroFullComponent {}