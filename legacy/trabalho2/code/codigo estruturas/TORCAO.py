# -*- coding: utf-8 -*-
"""
Created on Thu Jun 15 13:29:07 2023

@author: Emilly Raiane
"""

from sympy import symbols, Eq, solve
import numpy as np
import matplotlib.pyplot as plt
from scipy.integrate import cumtrapz
import PARAMETROS
import RESULTADOS

def theta(q1, q2, q3):
    t1, t2, t3, c, h = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3, PARAMETROS.DIM_CORDA, PARAMETROS.DIM_H
    G1, G2 = PARAMETROS.MODULO_CISALHAMENTO_1, PARAMETROS.MODULO_CISALHAMENTO_2
    G0 = G1

    hT = t1+h

    b1 = t2/2+c/3+t3/2
    Am1 = b1*hT
    int11 = 2*q1*b1/(t1*G1/G0)
    int12 = q1*hT/(t2*G2/G0)
    int13 = (q1-q2)*hT/(t3*G2/G0)
    theta1 = (int11+int12+int13)/(2*Am1*G0)

    b2 = t3+c/3
    Am2 = b2*hT
    int21 = 2*q2*b2/(t1*G1/G0)
    int22 = (q2-q1)*hT/(t3*G2/G0)
    int23 = (q2-q3)*hT/(t3*G2/G0)
    theta2 = (int21+int22+int23)/(2*Am2*G0)

    b3 = t3/2+c/3+t2/2
    Am3 = b3*hT
    int31 = 2*q3*b3/(t1*G1/G0)
    int32 = q3*hT/(t2*G2/G0)
    int33 = (q3-q2)*hT/(t3*G2/G0)
    theta3 = (int31+int32+int33)/(2*Am3*G0)
    return theta1, theta2, theta3

def torque(q1,q2,q3):
    t1, t2, t3, c, h = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3, PARAMETROS.DIM_CORDA, PARAMETROS.DIM_H
    hT = t1+h

    b1 = t2/2+c/3+t3/2
    b2 = t3+c/3
    b3 = t3/2+c/3+t2/2

    Am1 = b1*hT
    Am2 = b2*hT
    Am3 = b3*hT

    T = 2*(Am1*q1+Am2*q2+Am3*q3)
    return T

def dist_ang():

  b = PARAMETROS.DIM_ENVERG
  semi_enverg = np.linspace(0, b/2, 50)
  q1, q2, q3 = symbols('q1 q2 q3')

  theta1, theta2, theta3 = theta(q1, q2, q3)
  T = torque(q1,q2,q3)

  eq1 = Eq(theta1, theta2)
  eq2 = Eq(theta2, theta3)
  eq3 = Eq(T,1)
  solucoes = solve((eq1, eq2, eq3), (q1, q2, q3))

  q = []

  for valor in solucoes.values():
    q.append(float(valor))

  RESULTADOS.Q1 = q[0]
  RESULTADOS.Q2 = q[1]
  RESULTADOS.Q3 = q[2]
  
  q1_func = np.linspace(q[0],0, 50)
  q2_func = np.linspace(q[1],0, 50)
  q3_func = np.linspace(q[2],0, 50)

  theta1_func, theta2_func, theta3_func = theta(q1_func, q2_func, q3_func)

  
  thetaf = cumtrapz(theta1_func,semi_enverg,initial=0)

  print('Taxa de variação do ângulo de torção ao longo da semi-envergadura')
  plt.plot(semi_enverg,theta1_func,'r')
  plt.xlabel('Envergadura (m)')
  plt.ylabel('Taxa de Variação do Ângulo de Torção')
  plt.grid(True)
  plt.show()

  print('Variação do ângulo de torção ao longo da semi-envergadura')
  plt.plot(semi_enverg,thetaf,'r')
  plt.xlabel('Envergadura (m)')
  plt.ylabel('Ângulo de Torção')
  plt.grid(True)
  plt.show()

  return q