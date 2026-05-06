import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { Header } from './header';

async function createComponent(): Promise<ComponentFixture<Header>> {
  await TestBed.configureTestingModule({
    imports: [Header],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(Header);
  await fixture.whenStable();
  return fixture;
}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    fixture = await createComponent();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
