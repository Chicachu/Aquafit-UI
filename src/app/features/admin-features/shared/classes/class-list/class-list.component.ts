import { Component } from "@angular/core";
import { ButtonType } from "../../breadcrumb-nav-bar/breadcrumb-nav-bar.component";
import { Class } from "@/core/types/classes/class";
import { ClassService } from "@/core/services/classService";
import { SnackBarService } from "@/core/services/snackBarService";
import { Router } from "@angular/router";
import { ClassType } from "@/core/types/enums/classType";
import { UserService } from "@/core/services/userService";

@Component({
  selector: 'app-class-list',
  templateUrl: './class-list.component.html',
  styleUrls: ['./class-list.component.scss']
})
export class ClassListComponent {
  ButtonType = ButtonType
  classes: Class[] | null = null

  constructor(
    private classService: ClassService,
    private snackBarService: SnackBarService,
    private router: Router,
    private userService: UserService
  ) {
  }

  get buttonType(): ButtonType {
    return this.userService.isAdmin ? ButtonType.ADD : ButtonType.NONE
  }

  ngOnInit(): void {
    this.classService.getAllClasses().subscribe({
      next: (classes: Class[]) => {
        this.classes = classes
      },
      error: ({error}) => {
        this.snackBarService.showError(error.message)
      }
    })
  }

  addNewClass(): void {
    this.router.navigate(['/admin/mobile/classes/add-class'])
  }

  get classesGrouped(): Map<ClassType, Map<string, Class[]>> | undefined {
    return this.classes?.reduce((typeMap, class_) => {
      if (!typeMap.has(class_.classType)) {
        typeMap.set(class_.classType, new Map<string, Class[]>());
      }
      
      const locationMap = typeMap.get(class_.classType)!;
      
      const locationClasses = locationMap.get(class_.classLocation) || [];
      locationClasses.push(class_);
      locationMap.set(class_.classLocation, locationClasses);
   
      return typeMap;
    }, new Map<ClassType, Map<string, Class[]>>());
  }
}