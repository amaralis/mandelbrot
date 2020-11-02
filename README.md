# mandelbrot

Mandelbrot fractal explorer

Explore the Mandelbrot and Julia sets with your mouse. That's... pretty much it. Thanks to the Coding Train for the inspiration and help!

This project uses web workers to break up the M set into as many logical cores as the machine running the browser has. The more cores, the faster, the calculations. However, the program is written in Javascript. Which means floating point accuracy isn't very good. It's still a lot of fun to explore!

Play around with it at https://amaralis.github.io/mandelbrot/
