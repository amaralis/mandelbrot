# Mandelbrot

Mandelbrot fractal explorer

Explore the Mandelbrot and Julia sets with your mouse. That's... pretty much it. Thanks to the Coding Train for the inspiration and help!

This project uses web workers to break up the M set into as many logical cores as the machine running the browser has. The more cores, the faster the calculations. However, the program is written in Javascript. Which means floating point accuracy isn't very good. It's still a lot of fun to explore!

Play around with it at https://amaralis.github.io/mandelbrot/

# What I set out to achieve with this project

- [X] Well duh... a Mandelbrot set explorer!
- [X] Learn how to use web workers to perform intensive, time-consuming calculations
- [ ] Creating clean, maintainable code... dammit

## What I learned

* Okay, I admit, I wasn't too set on learning how to use web workers to spread the calculations across multiple logical cores depending on the hardware, since the concept sounds *waaaaaaaay* too advanced for a newbie on their third project... but hey, it really is ridiculously easy! worker.postMessage, worker.onmessage! *boom!*
* Clean, maintainable code remains my nemesis. This project is when I started listening to Uncle Bob's talks. Most of them are still way over my head, but something might stick... I hope
* Highschool level maths are still a little too much sand for my truck... unfortunately, I couldn't really color the sets like I wish I could
* I was actually not planning on doing the Julia set. This was supposed to be a Mandelbrot set explorer, not Julia. But as I learned about them, the two are so beautifully intertwined that I just had to go that extra step. Thanks to the Numberphile YouTube channel for the good vibes!
