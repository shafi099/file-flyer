import { Component, ViewChild, ElementRef,} from '@angular/core';
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

  @ViewChild('downloadButtonPlaceholder', { static: false }) downloadButtonPlaceholder!: ElementRef;

 



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

backHome(){
  this.fileFlyerOptions= 'options'
}

onDrop(event: DragEvent) {
  event.preventDefault();
  event.stopPropagation();
  (event.currentTarget as HTMLElement).classList.remove('drag-over');

  const files = event.dataTransfer!.files;
  // console.log(files.length)
  // console.log(files)
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
      // console.log('File dropped:', file.name);
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
decodeBtn :any = false
encodeFromText(e:any){
  const textArea = document.getElementById('encodeTextDrop') as HTMLTextAreaElement;
  if(textArea.value.length !== 0){
    this.decodeBtn = true
  }
  else{
    this.decodeBtn = false;
  }
}

decodeText(){
  const textArea = document.getElementById('encodeTextDrop') as HTMLTextAreaElement;
  this.fileFlyerFile = 'data:application/zip;base64,'+textArea.value ;
  this.alertMessage = 'Your file is ready, click the button below';
  this.downloadBtn = true;
}


fileEncode() {
  if (this.fileBox.length > 0) {
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
      // Create a base64-encoded text file from the ZIP blob
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        // console.log('base64',base64String);
        const base64 = base64String.replace('data:application/zip;base64,','');
        
        // console.log('base64',base64);
        // Create a Blob containing the base64-encoded text
        const textBlob = new Blob([base64], { type: 'text/plain' });

        // Create a new ZIP file and add the base64 text file
        const zipWithText = new JSZip();
        zipWithText.file('base64.txt', textBlob, { compression: 'DEFLATE' });

        // Generate the final ZIP file asynchronously
        zipWithText.generateAsync({ type: 'blob' }).then((finalBlob) => {
          // Save the final ZIP file with a specified name (e.g., 'encoded.zip')
          FileSaver.saveAs(finalBlob, 'file-flyer.zip');
        });

        this.fileFlyerOptions = 'options';
      };
      reader.readAsDataURL(blob);
    });
  }
}



alertMessage:any = ''
downloadBtn:any = false;
fileFlyerFile:any = '';
downloadInProgress: boolean = false;
downloadProgress: number = 0;


readFileDecode(event: Event) {
  const inputElement = event.target as HTMLInputElement;
  if (inputElement.files && inputElement.files.length > 0) {
    const file = inputElement.files[0];
    const allowedFileTypes = ['application/zip', 'application/x-zip-compressed'];


    if (allowedFileTypes.includes(file.type)) {
      // Read the uploaded ZIP file
      const reader = new FileReader();

      reader.onload = async (e: any) => {
        const zipContent = e.target.result;
      
        // Create a new JSZip instance and load the uploaded ZIP content
        const zip = new JSZip();
        await zip.loadAsync(zipContent);
      
        // Extract the base64 text file from the ZIP
        const base64TextFile = await zip.file('base64.txt')?.async('text');
      
        if (base64TextFile) {
          // console.log('Base64 String:', base64TextFile);
          this.fileFlyerFile = 'data:application/zip;base64,'+base64TextFile ;
          
          this.downloadInProgress = true;
            this.downloadProgress = 0;
          this.alertMessage = 'Your file is ready, click the button below';
          this.downloadBtn = true;
          // Create a Blob from the base64 text
          const textBlob = new Blob([base64TextFile], { type: 'text/plain' });
      
          // Create a new ZIP file containing the original files
          // const newZip = new JSZip();
          // this.fileBox.forEach((originalFile) => {
          //   newZip.file(originalFile.name, originalFile);
          //   // console.log(base64TextFile);
          // });
      
          // Generate the final ZIP file asynchronously
          // newZip.generateAsync({ type: 'blob' }).then((finalBlob) => {
            // Display the download button and hide the progress bar
            
      
            // Save the final ZIP file with a specified name (e.g., 'decoded.zip')
            // FileSaver.saveAs(finalBlob, 'decoded.zip');
          // });
      
          // Create a download link for the base64 text
          const blobUrl = URL.createObjectURL(textBlob);
          const anchor = document.createElement('a');
          anchor.href = blobUrl;
          anchor.download = 'decoded.txt';
          URL.revokeObjectURL(blobUrl);
        } else {
          this.alertMessage = 'Base64 text file not found in the ZIP.';
        }
      };
      
      // Update the progress bar during the download
      reader.onprogress = (e: ProgressEvent) => {
        if (e.lengthComputable) {
          this.downloadProgress = (e.loaded / e.total) * 100;
          // console.log('progress',(e.loaded / e.total) * 100)
        }
      };
      
      this.downloadBtn = true;
      reader.readAsArrayBuffer(file);
    } else {
      this.alertMessage = 'Invalid file type. Please upload a .zip file.';
      console.log('Invalid file type. Please upload a .zip file.');
    }
  }
  // this.downloadBtn = true;
}










































}
