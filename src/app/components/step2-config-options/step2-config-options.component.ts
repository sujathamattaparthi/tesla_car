import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CarService } from "../../services/car.service";
import { Subscription, take } from "rxjs";
import {
  CarFullModel,
  configModel,
  configsOptionModel,
} from "../../models/car.model";

@Component({
  selector: "app-step2-config-options",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./step2-config-options.component.html",
  styleUrl: "./step2-config-options.component.scss",
})
export class Step2ConfigOptionsComponent implements OnInit, OnDestroy {
  configOptionForm!: FormGroup;
  subscription: Subscription = new Subscription();
  carModelColorData!: CarFullModel;
  configData!: configModel;
  selectedConfigItem!: configsOptionModel | undefined;
  generatedCarImage: string = "";

  constructor(private fb: FormBuilder, private carService: CarService) {}

  ngOnInit() {
    this.getCarStepDetails();
  }

  getCarStepDetails() {
    this.buildConfigForm();
    this.subscription = this.carService.carStepData
      .pipe(take(1))
      .subscribe((res) => {
        // console.log("car details step 2 ...........>", res);
        if (Object.keys(res).length) {
          this.carModelColorData = res;
          this.generatedCarImage = res.selectedImage;
          this.getConfigurations(res);
          this.updateConfigrations(res);
          this.handleFormValueChange();
        }
      });
  }

  buildConfigForm() {
    this.configOptionForm = this.fb.group({
      configType: [""],
      towHitch: [""],
      yoke: [""],
    });
  }

  updateConfigrations(_data: CarFullModel) {
    this.selectedConfigItem = _data.selectedConfig;
    this.configOptionForm.patchValue({
      configType: _data.selectedConfigId ? _data.selectedConfigId : "",
      towHitch: _data.selectedTowHitch,
      yoke: _data.selectedYoke,
    });
  }

  getConfigurations(carDetais: CarFullModel) {
    this.subscription = this.carService
      .getCarConfig(carDetais.selectedModelValue)
      .subscribe((res) => {
        if (res) {
          this.configData = res;
        }
      });
  }

  handleFormValueChange() {
    // const configType = this.configOptionForm.get("configType")?.value;
    this.subscription = this.configOptionForm.valueChanges.subscribe((val) => {
      if (val.configType) {
        this.selectedConfigItem = this.configData?.configs.find(
          (item) => item.id == val.configType
        );
        const carFullData = {
          ...this.carModelColorData,
          selectedConfig: this.selectedConfigItem,
          selectedConfigId: val.configType,
          selectedTowHitch: val.towHitch,
          selectedYoke: val.yoke,
        };
        this.setCarStepData(carFullData);
      }
    });
  }

  setCarStepData(_data: CarFullModel) {
    this.carService.setCarStepData(_data);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
