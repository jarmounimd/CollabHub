import { Component } from '@angular/core';
import { CollabLogoSvgComponent } from '../../shared/components/collab-logo-svg/collab-logo-svg.component';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  imports: [CollabLogoSvgComponent],
  standalone: true,
})
export class LandingComponent {}
