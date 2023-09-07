import { Component, ViewChild, ElementRef, OnInit  } from '@angular/core';
// import * as JSZip from 'jszip';
// import { Component, OnInit } from '@angular/core';  
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';  
import * as JSZip from 'jszip';  
import * as FileSaver from 'file-saver';  
// import { TableModule } from 'primeng/table';  
// import { GlobalServicesService } from 'src/app/services/global-services.service'; 
// import ascii85 from 'ascii85';
// import { PDFDocument, rgb } from 'pdf-lib';
// import { readFile } from 'pdf-parse';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'file-flyer';

  fileFlyerOptions:any = 'options';

  toggleOptions(option:string){
    
    this.fileFlyerOptions=option ;
  }


  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'copy';
    (event.currentTarget as HTMLElement).classList.add('drag-over'); // Use type assertion
  }
  

  items: any[] = [];
  sizes:any[] = [];
  fileBox:any[] = [];


itemsLength(){
  return this.items.length
}

itemsSize() {
  let bytes = 0;

  for (let size of this.sizes) {
    bytes += parseFloat(size);
  }

  const megabytes = bytes / (1024 * 1024);
  return megabytes.toFixed(2) + ' MB';
}

onDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  (event.currentTarget as HTMLElement).classList.remove('drag-over');

  const files = event.dataTransfer!.files;
  console.log(files.length)
  console.log(files)
  if (files.length > 0) {
    for (let i = 0; i < files.length; i++) {
      this.fileBox.push(files[i]); // Push each file into the fileBox array
    }
  }

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
      this.sizes.push(file.size.toString()); // Store raw file size in bytes
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
    this.sizes.splice(index,1);
    this.fileBox.splice(index,1);
  }
  
  


  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const files = inputElement.files;
  
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        this.fileBox.push(files[i]); // Push each file into the fileBox array
      }
      this.handleFiles(files);
    }
  }



 

 


//   fileEncode() {
//     // const files = this.items.map(item => item.name);
//   //  console.log(files)
//    console.log(this.fileBox)
//   //  const zip = new JSZip();

//   // // Iterate through each file in fileBox and add them to the ZIP
//   // for (let i = 0; i < this.fileBox.length; i++) {
//   //   const file = this.fileBox[i];

//   //   // Use the file's name as the entry name in the ZIP
//   //   zip.file(file.name, file);
//   // }

//   // // Generate the ZIP file asynchronously
//   // zip.generateAsync({ type: 'blob' }).then((blob) => {
//   //   // Save the ZIP file with a specified name (e.g., 'compressed.zip')
//   //   FileSaver.saveAs(blob, 'compressed.zip');
//   // });
//   // }
//   // Create a new instance of JSZip
// const zip = new JSZip();

// // Iterate through each file in fileBox and add them to the ZIP
// for (let i = 0; i < this.fileBox.length; i++) {
//   const file = this.fileBox[i];

//   // Use the file's name as the entry name in the ZIP
//   // You can set the compression level here (e.g., 'DEFLATE' for standard compression)
//   zip.file(file.name, file, { compression: 'DEFLATE' });
// }

// // Generate the ZIP file asynchronously
// zip.generateAsync({ type: 'blob' }).then((blob) => {
//   // Save the ZIP file with a specified name (e.g., 'compressed.zip')
//   FileSaver.saveAs(blob, 'compressed.zip');
// });

// }

fileEncode() {
  if(this.fileBox.length>0){
  const zip = new JSZip();

  // Iterate through each file in fileBox and add them to the ZIP
  for (let i = 0; i < this.fileBox.length; i++) {
    const file = this.fileBox[i];

    // Use the file's name as the entry name in the ZIP
    // You can set the compression level here (e.g., 'DEFLATE' for standard compression)
    zip.file(file.name, file, { compression: 'DEFLATE' });
  }

  // Generate the ZIP file asynchronously
  zip.generateAsync({ type: 'blob' }).then((blob) => {
    // Convert the ZIP blob to Base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Log the Base64-encoded string to the console
      const blob = new Blob([base64String], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'file.txt';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      window.URL.revokeObjectURL(url);
      this.fileFlyerOptions='options'
    };
    reader.readAsDataURL(blob);
  });
}
}


alertMessage:any = ''
downloadBtn:any = false;
fileFlyerFile:any = '';

readFileDecode(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  if (inputElement.files && inputElement.files.length > 0) {
    const file = inputElement.files[0];
    const allowedFileTypes = ['text/plain'];

    if (allowedFileTypes.includes(file.type)) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        const fileContent = e.target.result;
        const fileName = 'file-flyer.zip';
        this.fileFlyerFile = fileContent;
        this.alertMessage= 'Your file is ready, click the button below' ;
        this.downloadBtn = true
      };

      reader.readAsText(file);
    } else {
      this.alertMessage= 'Invalid file type. Please upload a .txt file.'
      console.log('Invalid file type. Please upload a .txt file.');
    }
  }
}




}
