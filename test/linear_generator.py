import numpy as np

m_true = -0.9594
b_true = 4.294
f_true = 0.534

N = 50
x = np.sort(10 * np.random.rand(N))
yerr = 0.1 + 0.5 * np.random.rand(N)
y = m_true * x + b_true
y += np.abs(f_true * y) + np.random.randn(N)
y += yerr * np.random.randn(N)

dump = {'x': list(x), 'y': list(y), 'yerr': list(yerr)}
with open('linear.json', 'w') as f:
  json.dump(dump, f)
