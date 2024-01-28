import { Component } from '@angular/core';

@Component({
  standalone: true,
  selector: 'as-flex-form',
  styles: [
    `
      .flex-form {
        display: flex;
        align-items: flex-end;
        flex-wrap: wrap;
        gap: 16px;
      }

      .name-field {
        flex: 1 1 160px;
      }

      .email-field {
        flex: 3 1 220px;
      }

      .button {
        flex: 1 1 80px;
      }

      label {
        font-weight: 600;
        color: #fff
      }
      input {
        --color-gray-700: hsl(210deg, 14%, 66%);
        display: block;
        width: 100%;
        background: transparent;
        border-top: none;
        border-right: none;
        border-left: none;
        border-image: initial;
        border-bottom: 2px solid var(--color-gray-700);
        color: #fff;
        height: 2.5rem;
        border-radius: 2px;
        outline-color: rgb(255, 221, 51);
        outline-offset: 4px;
        font-weight: 400
      }

      button {
        --color-background: hsl(210deg, 30%, 12%);
        flex: 1 1 80px;
        height: 2.5rem;
        background: rgb(230, 230, 230);
        border: none;
        color: var(--color-background);
        border-radius: 4px;
        font-weight: 700;
        outline-color: rgb(255, 221, 51);
        outline-offset: 4px;
        padding: 1px 6px;
      }
    `
  ],
  template: `
    <form class="flex-form">
      <label for="name" class="name-field">
        Name:
        <input id="name" type="name" class="name-field" placeholder="Your name" />
      </label>
      <label for="email" class="email-field">
        Email:
        <input id="email" type="email" class="email-field" placeholder="example@domain.com" />
      </label>
      <button class="submit">Submit</button>
    </form>
  `
})
export class FlexFormComponent {}
