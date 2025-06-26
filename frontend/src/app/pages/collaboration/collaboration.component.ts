import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  NgZone,
  AfterViewChecked,
} from '@angular/core';
import { ProjectService, Project } from '../../core/services/project.service';
import {
  MessageService,
  Message,
  CreateMessageDto,
} from '../../core/services/message.service';
import { FileService, FileMeta } from '../../core/services/file.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReactiveFormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

@Component({
  selector: 'app-collaboration',
  templateUrl: './collaboration.component.html',
  styleUrls: ['./collaboration.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  providers: [DatePipe],
  animations: [
    trigger('cardHover', [
      state('void', style({ transform: 'scale(1)', boxShadow: 'none' })),
      state(
        '*',
        style({
          transform: 'scale(1.03)',
          boxShadow: '0 8px 32px rgba(79, 172, 254, 0.18)',
        })
      ),
      transition('void <=> *', animate('200ms ease-in-out')),
    ]),
  ],
})
export class CollaborationComponent implements OnInit, AfterViewChecked {
  projects: Project[] = [];
  isLoading = true;
  error: string | null = null;
  selectedProject: Project | null = null;
  messages: Message[] = [];
  files: FileMeta[] = [];
  messageForm!: FormGroup;
  uploading = false;
  currentUserId = '';
  showFilesPanel = false;
  showFilesDialogOpen = false;
  private shouldScroll = false;

  @ViewChild('messagesScroll') messagesScroll!: ElementRef;

  constructor(
    private projectService: ProjectService,
    private messageService: MessageService,
    private fileService: FileService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    // Get user from localStorage and extract _id
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserId = user._id;
        console.log('DEBUG loaded currentUserId:', this.currentUserId);
      } catch (e) {
        this.currentUserId = '';
        console.warn('Could not parse user from localStorage');
      }
    }
    this.loadProjects();
    this.messageForm = this.fb.group({
      messageText: [''],
      attachments: [[]],
    });
  }

  loadProjects(): void {
    this.isLoading = true;
    this.error = null;
    this.projectService.getProjects().subscribe({
      next: (projects) => {
        console.log('Loaded projects:', projects); // <--- Add this
        this.projects = projects.map((project) => ({
          ...project,
          createdBy: project.createdBy || {
            firstName: 'Unknown',
            lastName: '',
            email: '',
            _id: '',
          },
          groupId: project.groupId || {
            name: 'No Group',
            _id: '',
            description: '',
          },
          progress: project.progress ?? 0,
        }));
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Failed to load projects. Please try again.';
        this.isLoading = false;
      },
    });
  }

  selectProject(project: Project) {
    this.selectedProject = project;
    this.loadMessages();
    this.loadFiles();
  }

  loadMessages() {
    if (!this.selectedProject) return;
    this.messageService
      .getMessagesByProject(this.selectedProject._id)
      .subscribe((messages) => {
        this.messages = messages;
        this.shouldScroll = true;
        this.cdr.detectChanges();
      });
  }

  loadFiles() {
    if (!this.selectedProject) return;
    this.fileService
      .getFilesByProject(this.selectedProject._id)
      .subscribe((files) => {
        this.files = files;
      });
  }

  sendMessage() {
    if (!this.selectedProject) return;
    const dto = {
      messageText: this.messageForm.value.messageText,
      projectId: this.selectedProject._id,
    };
    this.messageService.sendMessage(dto).subscribe((msg) => {
      this.messages.push(msg);
      this.messageForm.reset({ messageText: '', attachments: [] });
      this.shouldScroll = true;
      this.cdr.detectChanges();
    });
  }

  onFileSelected(event: any) {
    if (!this.selectedProject) return;
    const file: File = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    this.fileService
      .uploadFile(file, this.selectedProject._id)
      .subscribe((meta) => {
        this.files.push(meta);
        const attachments = this.messageForm.value.attachments || [];
        attachments.push(meta.fileUrl);
        this.messageForm.patchValue({ attachments });
        this.uploading = false;
      });
  }
  isActiveProject(project: Project): boolean {
    return !!this.selectedProject && this.selectedProject._id === project._id;
  }
  isSenderObject(
    sender: any
  ): sender is { _id: string; firstName: string; lastName: string } {
    return (
      sender &&
      typeof sender === 'object' &&
      'firstName' in sender &&
      'lastName' in sender
    );
  }
  getMessageClass(msg: Message): string {
    let senderId = this.isSenderObject(msg.senderId)
      ? msg.senderId._id
      : msg.senderId;
    // Debug output
    console.log(
      'DEBUG compare senderId:',
      senderId,
      'currentUserId:',
      this.currentUserId,
      'equal:',
      String(senderId).trim() === String(this.currentUserId).trim()
    );
    return String(senderId).trim() === String(this.currentUserId).trim()
      ? 'own-message'
      : 'other-message';
  }
  getFileIcon(fileType: string): string {
    if (!fileType) return 'insert_drive_file';
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'movie';
    if (fileType.startsWith('audio/')) return 'audiotrack';
    if (fileType === 'application/pdf') return 'picture_as_pdf';
    if (fileType.includes('spreadsheet')) return 'grid_on';
    if (fileType.includes('word')) return 'description';
    if (fileType.includes('presentation')) return 'slideshow';
    if (fileType.includes('zip') || fileType.includes('rar')) return 'archive';
    return 'insert_drive_file';
  }

  showFilesDialog() {
    this.showFilesDialogOpen = true;
  }

  closeFilesDialog() {
    this.showFilesDialogOpen = false;
  }

  downloadFile(file: FileMeta) {
    fetch(file.fileUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.fileName || 'download';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch(() => {
        window.open(file.fileUrl, '_blank');
      });
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesScroll && this.messagesScroll.nativeElement) {
        console.log('Scrolling to bottom...');
        this.messagesScroll.nativeElement.scrollTop =
          this.messagesScroll.nativeElement.scrollHeight;
      }
    }, 0);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollToBottom();
      this.shouldScroll = false;
    }
  }
}
