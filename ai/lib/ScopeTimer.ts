export class ScopeTimer {
    private timeLeft: number = 0; // Time left in milliseconds
    private on: boolean = false; // Timer status
    private intervalId: NodeJS.Timeout | null = null; // Reference to the interval for clearing
    private onTimeUp: (() => void) | null = null; // Callback for when time is up
  
    constructor(onTimeUp: () => void) {
      this.onTimeUp = onTimeUp;
    }
  
    public start(duration: number) {
      if (this.on) {
        this.stop(); // Stop any existing timer before starting a new one
      }
      this.timeLeft = duration;
      this.on = true;
  
      this.intervalId = setInterval(() => {
        this.timeLeft -= 1000; // Decrease time left by 1 second
        if (this.timeLeft <= 0) {
          this.stop();
          if (this.onTimeUp) {
            this.onTimeUp(); // Notify the callback when time is up
          }
        }
      }, 1000); // Runs every second
    }
  
    public stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId); // Clear the interval
        this.intervalId = null;
      }
      this.on = false;
      this.timeLeft = 0;
    }
  
    public getTimeLeft(): number {
      return this.timeLeft;
    }
  
    public isRunning(): boolean {
      return this.on;
    }
  }