import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

async function configureAppTestBed(): Promise<void> {
  await TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter([])],
  }).compileComponents();
}

async function createStableAppFixture() {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  return fixture;
}

describe('App', () => {
  beforeEach(async () => configureAppTestBed());
  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
  it('should render the header', async () => {
    const fixture = await createStableAppFixture();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
  });
});
