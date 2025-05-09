import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, Subscription } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  teamMembers: number;
}

interface RecentActivity {
  id: string;
  type: 'project' | 'task' | 'message' | 'member';
  action: string;
  description: string;
  timestamp: Date;
  user: {
    name: string;
    avatar: string;
  };
}

interface ProjectOverview {
  id: string;
  name: string;
  progress: number;
  dueDate: Date;
  status: 'on-track' | 'at-risk' | 'delayed';
  teamMembers: {
    name: string;
    avatar: string;
  }[];
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  isLoading = false;
  stats: DashboardStats = {
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
  };

  recentActivities: RecentActivity[] = [];
  projectOverviews: ProjectOverview[] = [];
  private routerSubscription: Subscription;

  constructor(private router: Router) {
    // Subscribe to router events to refresh data when navigating to dashboard
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url === '/dashboard') {
          this.loadDashboardData();
        }
      });
  }

  ngOnInit() {
    this.loadDashboardData();
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadDashboardData() {
    this.isLoading = true;

    // Simulate API call delay
    setTimeout(() => {
      // TODO: Replace with actual API calls
      this.stats = {
        totalProjects: 12,
        activeTasks: 24,
        completedTasks: 48,
        teamMembers: 8,
      };

      this.recentActivities = [
        {
          id: '1',
          type: 'project',
          action: 'created',
          description: 'New project "Website Redesign" was created',
          timestamp: new Date(),
          user: {
            name: 'John Doe',
            avatar: 'assets/default-avatar.png',
          },
        },
        {
          id: '2',
          type: 'task',
          action: 'completed',
          description: 'Task "Update Homepage" was completed',
          timestamp: new Date(Date.now() - 3600000),
          user: {
            name: 'Jane Smith',
            avatar: 'assets/default-avatar.png',
          },
        },
      ];

      this.projectOverviews = [
        {
          id: '1',
          name: 'Website Redesign',
          progress: 75,
          dueDate: new Date(Date.now() + 7 * 24 * 3600000),
          status: 'on-track',
          teamMembers: [
            {
              name: 'John Doe',
              avatar: 'assets/default-avatar.png',
            },
            {
              name: 'Jane Smith',
              avatar: 'assets/default-avatar.png',
            },
          ],
        },
        {
          id: '2',
          name: 'Mobile App Development',
          progress: 45,
          dueDate: new Date(Date.now() + 14 * 24 * 3600000),
          status: 'at-risk',
          teamMembers: [
            {
              name: 'Mike Johnson',
              avatar: 'assets/default-avatar.png',
            },
          ],
        },
      ];

      this.isLoading = false;
    }, 500);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'on-track':
        return '#4caf50';
      case 'at-risk':
        return '#ff9800';
      case 'delayed':
        return '#f44336';
      default:
        return '#9e9e9e';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'on-track':
        return 'On Track';
      case 'at-risk':
        return 'At Risk';
      case 'delayed':
        return 'Delayed';
      default:
        return 'Unknown';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'project':
        return 'folder';
      case 'task':
        return 'assignment';
      case 'message':
        return 'chat';
      case 'member':
        return 'person';
      default:
        return 'info';
    }
  }
}
