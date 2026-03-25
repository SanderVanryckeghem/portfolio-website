import { TestBed } from '@angular/core/testing';

import { CVGeneratorService } from './cv-generator';

describe('CVGeneratorService', () => {
  let service: CVGeneratorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CVGeneratorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
