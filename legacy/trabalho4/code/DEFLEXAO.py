# -*- coding: utf-8 -*-
"""
Created on Sun Jun  4 15:29:01 2023

@author: Emilly Raiane
"""
import RESULTADOS
import PARAMETROS
from scipy.integrate import cumtrapz
import numpy as np
import matplotlib.pyplot as plt

def calc_deflexao():
  Iyy_pond, Izz_pond = RESULTADOS.IYY_POND, RESULTADOS.IZZ_POND 
  My, Mz = RESULTADOS.MY, RESULTADOS.MZ
  E0 = PARAMETROS.MODULO_ELASTICIDADE_1
  b = PARAMETROS.DIM_ENVERG
  semi_enverg = np.linspace(0, b/2, 50)

  dvdx = cumtrapz(Mz,semi_enverg,initial=0)
  v = cumtrapz(dvdx,semi_enverg,initial=0)/(E0*Izz_pond)
  dwdx = cumtrapz(My,semi_enverg,initial=0)
  w = cumtrapz(dwdx,semi_enverg,initial=0)/(E0*Iyy_pond)
  
  d_maxz = np.max(abs(v))
  d_maxy = np.max(abs(w))

  print('Deflexão no eixo y e z em função da semi envergadura')
  
  plt.plot(semi_enverg, w*1000,'r',label='Deflexão no eixo y')
  plt.plot(semi_enverg, v*1000,'b',label='Deflexão no eixo z')
  plt.xlabel('Semi envergadura (m)')
  plt.ylabel('Deflexão (mm)')
  plt.legend()
  plt.grid(True)
  plt.show()
  
  return d_maxy, d_maxz 