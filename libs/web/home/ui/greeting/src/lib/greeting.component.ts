import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'as-greeting',
  templateUrl: './greeting.component.html',
  styleUrls: ['./greeting.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GreetingComponent {
  get message() {
    const now = new Date();
    const hours = now.getHours();
    const text = hours < 12 ? 'Morning 🌞' : hours < 18 ? 'Afternoon 🌤' : 'Evening 🌙';
    return `Good ${text} ${randomEmoji()}`
  }
}

function randomEmoji(): string {
  const emojis: string[] = ["😘", "🤓", "😜", "🤪", "😎", "🤩", "🥳", "🤘", "🎉", "🔥"];
  return emojis[Math.floor(Math.random() * emojis.length)];
}
