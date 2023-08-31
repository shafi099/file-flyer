import { Component, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'file-flyer';
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
    (event.currentTarget as HTMLElement).classList.add('drag-over'); // Use type assertion
  }
  

  items: any[] = [];

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    (event.currentTarget as HTMLElement).classList.remove('drag-over');

    const files = event.dataTransfer!.files;

    if (files.length > 0) {
      this.handleFiles(files);
    }
  }

  handleFiles(files: FileList) {
    const fileListArray = Array.from(files);
  
    for (let i = 0; i < fileListArray.length; i++) {
      const file = fileListArray[i];
      console.log('File dropped:', file.name);
      this.items.push({
        name: file.name,
        size: this.formatFileSize(file.size)
      });
      
      // You can process the file here, e.g., upload to a server.
    }
  }
  
  formatFileSize(size: number): string {
    if (size < 1024) {
      return size + ' B';
    } else if (size < 1024 * 1024) {
      return (size / 1024).toFixed(2) + ' KB';
    } else {
      return (size / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  onDelete(index: number) {
    this.items.splice(index, 1);
  }
  
  


  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;

    if (files && files.length > 0) {
      this.handleFiles(files);
    }
  }
}
