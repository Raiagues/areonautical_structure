# -*- coding: utf-8 -*-
"""
Created on Thu May 18 17:28:30 2023

@author: Emilly Raiane
"""
from scipy.integrate import cumtrapz
import matplotlib.pyplot as plt
import numpy as np
import RESULTADOS
import PARAMETROS

def distribuicao_forcas():
  b, S, L, rho, V, CD0, k = PARAMETROS.DIM_ENVERG, RESULTADOS.S, RESULTADOS.L, PARAMETROS.DENSIDADE, PARAMETROS.VELOCIDADE, PARAMETROS.CD0, PARAMETROS.K
  lamb = 1
  semi_enverg = np.linspace(0, b/2, 50)

  w_elip = ((4*L)/(np.pi*b))*np.sqrt(1-(2*semi_enverg/b)**2)
  w_ret = (2*L/(b*(1+lamb)))*(1-2*(1-lamb)*semi_enverg/b)
  Leff = (w_elip+w_ret)/2

  CL = (2*Leff)/(rho*(V**2)*S)
  CD = CD0+k*(CL**2)
  Deff = 0.5*rho*(V**2)*CD*S

  return Leff, Deff

def sust_arrast():
  b = PARAMETROS.DIM_ENVERG
  semi_enverg = np.linspace(0, b/2, 50)
  Leff, Deff = distribuicao_forcas()
  print('Distribuição de Sustentação e Arrasto ao longo da Semi-Envergadura')
  plt.plot(semi_enverg,Leff/1e3,'r', label='Sustentação')
  plt.plot(semi_enverg,Deff/1e3, 'b', label='Arrasto')
  plt.xlabel('Envergadura (m)')
  plt.ylabel('Distribuição (kN/m)')
  #plt.title('Distribuição de Sustentação e Arrasto ao longo da Semi-Envergadura')
  plt.legend()
  plt.grid(True)
  plt.show()

Leff, Deff = distribuicao_forcas()

def decomposicao(Leff, Deff):
  L = Leff
  D = Deff
  alpha = PARAMETROS.ALPHA

  Ly = np.sin(alpha)*L
  Lz = np.cos(alpha)*L  
  Dy = np.cos(alpha)*D
  Dz = np.sin(alpha)*D
  
  Wy = Ly-Dy
  Wz = Lz+Dz
  
  return Wz, Wy


def cargas():
  b = PARAMETROS.DIM_ENVERG
  semi_enverg = np.linspace(0, b/2, 50)
  Leff, Deff = distribuicao_forcas()
  Wz, Wy = decomposicao(Leff, Deff)
  
  print('Decomposição da Distribuição dos Esforços ao longo da Semi-Envergadura')
  plt.plot(semi_enverg, Wy/1e3,'r', label='Decomposição em y')
  plt.plot(semi_enverg, Wz/1e3, 'b', label='Decomposição em z')
  plt.xlabel('Envergadura (m)')
  plt.ylabel('Distribuição (kN/m)')
  #plt.title('Decomposição da Distribuição dos Esforços ao longo da Semi-Envergadura')
  plt.legend()
  plt.grid(True)
  plt.show()


def esforco_cortante():
  b = PARAMETROS.DIM_ENVERG
  semi_enverg = np.linspace(0, b/2, 50)

  Leff, Deff = distribuicao_forcas()
  Wz, Wy = decomposicao(Leff, Deff)

  Vintz = cumtrapz(Wz,semi_enverg,initial=0)
  Vz = Vintz-Vintz[-1]

  Vinty = cumtrapz(Wy,semi_enverg,initial=0)
  Vy = Vinty-Vinty[-1]
  print('Esforço Cortante ao longo da Semi-Envergadura')
  plt.plot(semi_enverg,Vy/1e3,'r', label='Esforço em y')
  plt.plot(semi_enverg,Vz/1e3,'b', label='Esforço em z')
  plt.xlabel('Envergadura (m)')
  plt.ylabel('Esforço Cortante (kN)')
  #plt.title('Esforço Cortante ao longo da Semi-Envergadura')
  plt.legend()
  plt.grid(True)
  plt.show()


def momento_fletor():
  b = PARAMETROS.DIM_ENVERG
  semi_enverg = np.linspace(0, b/2, 50)

  Leff, Deff = distribuicao_forcas()
  Wz, Wy = decomposicao(Leff, Deff)
  
  Vintz = cumtrapz(Wz,semi_enverg,initial=0)
  Vz = Vintz-Vintz[-1]  
  Mintz = cumtrapz(Vz,semi_enverg,initial=0)
  Mz = Mintz-Mintz[-1]  

  Vinty = cumtrapz(Wy,semi_enverg,initial=0)
  Vy = Vinty-Vinty[-1]  
  Minty = cumtrapz(Vy,semi_enverg,initial=0)
  My = Minty-Minty[-1]  

  PARAMETROS.MY, PARAMETROS.MZ = My, Mz
  print('Momento Fletor ao longo da Semi-Envergadura')
  plt.plot(semi_enverg,My/1e3,'r', label='Momento em y');
  plt.plot(semi_enverg,Mz/1e3,'b', label='Momento em z');
  plt.xlabel('Envergadura (m)')
  plt.ylabel('Momento Fletor (kNm)')
  #plt.title('Momento Fletor ao longo da Semi-Envergadura')
  plt.legend()
  plt.grid(True)
  plt.show()
  
  return My, Mz