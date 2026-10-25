# -*- coding: utf-8 -*-
"""
Created on Wed Jun 21 14:36:49 2023

@author: Emilly Raiane
"""

import RESULTADOS
import PARAMETROS
import numpy as np
import matplotlib.pyplot as plt

def tau(indice):
  q = [RESULTADOS.Q1, RESULTADOS.Q2, RESULTADOS.Q3]
  t1, t2, t3 = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3

  tensao = [q[0]/t1,q[0]/t1,q[0]/t2,(q[0]-q[1])/t3, q[1]/t1,q[1]/t1,(q[1]-q[0])/t3,(q[1]-q[2])/t3,q[2]/t1,q[2]/t1,(q[2]-q[1])/t3,q[2]/t2]
  
  return abs(tensao[indice])

def dist_tensao_cis():
  t1, t2, t3, c, h = PARAMETROS.ESP_1, PARAMETROS.ESP_2, PARAMETROS.ESP_3, PARAMETROS.DIM_CORDA, PARAMETROS.DIM_H
  x, y = RESULTADOS.Y0_POND, RESULTADOS.Z0_POND

  b1_0 = 0-x; b1_1 = t2/2+c/3-x; h1_0 = h-y; h1_1 = h+t1-y
  b2_0 = 0-x; b2_1 = t2/2+c/3-x; h2_0 = 0-y; h2_1 = t1-y
  b3_0 = 0-x; b3_1 = t2-x; h3_0 = t1-y; h3_1 = h-y
  b4_0 = t2/2+c/3-t3/2-x; b4_1 = t2/2+c/3+t3/2-x; h4_0 = t1-y; h4_1 = h-y
  b5_0 = t2/2+c/3-x; b5_1 = 2*c/3+t2/2-x; h5_0 = h-y; h5_1 = h+t1-y
  b6_0 = t2/2+c/3-x; b6_1 = 2*c/3+t2/2-x; h6_0 = 0-y; h6_1 = t1-y
  b8_0 = t2/2+2*c/3-t3/2-x; b8_1 = t2/2+2*c/3+t3/2-x; h8_0 = t1-y; h8_1 = h-y
  b9_0 = t2/2+2*c/3-x; b9_1 = c+t2-x; h9_0 = h-y; h9_1 = h+t1-y
  b10_0 = t2/2+2*c/3-x; b10_1 = c+t2-x; h10_0 = 0-y; h10_1 = t1-y
  b12_0 = c-x; b12_1 = t2+c-x; h12_0 = t1-y; h12_1 = h-y

  x1 = np.linspace(b1_0,b1_1,50)
  y1 = np.linspace(h1_0,h1_1,50)
  x2 = np.linspace(b2_0,b2_1,50)
  y2 = np.linspace(h2_0,h2_1,50)
  x3 = np.linspace(b3_0,b3_1,50)
  y3 = np.linspace(h3_0,h3_1,50)
  x4 = np.linspace(b4_0,b4_1,50)
  y4 = np.linspace(h4_0,h4_1,50)
  x5 = np.linspace(b5_0,b5_1,50)
  y5 = np.linspace(h5_0,h5_1,50)
  x6 = np.linspace(b6_0,b6_1,50)
  y6 = np.linspace(h6_0,h6_1,50)
  x8 = np.linspace(b8_0,b8_1,50)
  y8 = np.linspace(h8_0,h8_1,50)
  x9 = np.linspace(b9_0,b9_1,50)
  y9 = np.linspace(h9_0,h9_1,50)
  x10 = np.linspace(b10_0,b10_1,50)
  y10 = np.linspace(h10_0,h10_1,50)
  x12 = np.linspace(b12_0,b12_1,50)
  y12 = np.linspace(h12_0,h12_1,50)
  

  b11_0 = 0-x; b11_1 = t2+c-x; h11_0 = h-y; h11_1 = h+t1-y
  b22_0 = 0-x; b22_1 = t2+c-x; h22_0 = 0-y; h22_1 = t1-y
  b33_0 = 0-x; b33_1 = t2-x; h33_0 = t1-y; h33_1 = h-y
  b44_0 = c-x; b44_1 = t2+c-x; h44_0 = t1-y; h44_1 = h-y
  b55_0 = c/3-x; b55_1 = c/3+t3 - x; h55_0 = t1-y; h55_1 = h-y
  b66_0 = 2*c/3-x; b66_1 = 2*c/3+t3 - x; h66_0 = t1-y; h66_1 = h-y


  x110 = [b11_0, b11_1, b11_1, b11_0, b11_0]
  y110 = [h11_0, h11_0, h11_1, h11_1, h11_0]
  x220 = [b22_0, b22_1, b22_1, b22_0, b22_0]
  y220 = [h22_0, h22_0, h22_1, h22_1, h22_0]
  x330 = [b33_0, b33_1, b33_1, b33_0, b33_0]
  y330 = [h33_0, h33_0, h33_1, h33_1, h33_0]
  x440 = [b44_0, b44_1, b44_1, b44_0, b44_0]
  y440 = [h44_0, h44_0, h44_1, h44_1, h44_0]
  x550 = [b55_0, b55_1, b55_1, b55_0, b55_0]
  y550 = [h55_0, h55_0, h55_1, h55_1, h55_0]
  x660 = [b66_0, b66_1, b66_1, b66_0, b66_0]
  y660 = [h66_0, h66_0, h66_1, h66_1, h66_0]

  xx1, yy1 = np.meshgrid(x1,y1)
  xx2, yy2 = np.meshgrid(x2,y2)
  xx3, yy3 = np.meshgrid(x3,y3)
  xx4, yy4 = np.meshgrid(x4,y4)
  xx5, yy5 = np.meshgrid(x5,y5)
  xx6, yy6 = np.meshgrid(x6,y6)
  xx8, yy8 = np.meshgrid(x8,y8)
  xx9, yy9 = np.meshgrid(x9,y9)
  xx10, yy10 = np.meshgrid(x10,y10)
  xx12, yy12 = np.meshgrid(x12,y12)

  z1 = np.full_like(xx1, tau(0))  
  z2 = np.full_like(xx2, tau(1))  
  z3 = np.full_like(xx3, tau(2))  
  z4 = np.full_like(xx4, tau(3))  
  z5 = np.full_like(xx5, tau(4))  
  z6 = np.full_like(xx6, tau(5))  
  z8 = np.full_like(xx8, tau(7))  
  z9 = np.full_like(xx9, tau(8))  
  z10 = np.full_like(xx10, tau(9))  
  z12 = np.full_like(xx12, tau(11))  

  lista_valores = [z1, z2, z3, z4, z5, z6, z8, z9, z10, z12]
  array_valores = np.array(lista_valores)

  v_max = np.amax(array_valores[np.logical_and(array_valores != 0, array_valores != np.inf)])
  v_min = np.amin(array_valores[np.logical_and(array_valores != 0, array_valores != np.inf)])
  
  fig, ax = plt.subplots(figsize=(12,4), ncols=2)  

  ax[0].fill(x110, y110, color='blue', alpha=0.5)
  ax[0].fill(x330, y330, color='green', alpha=0.5)
  ax[0].plot(0, 0,'ro')

  ax[0].fill(x220, y220, color='blue', alpha=0.5)
  ax[0].fill(x440, y440, color='green', alpha=0.5)
  ax[0].fill(x550, y550, color='green', alpha=0.5)
  ax[0].fill(x660, y660, color='green', alpha=0.5)  

  ax[0].plot(x110, y110, color='black', linewidth=0.8)
  ax[0].plot(x220, y220, color='black', linewidth=0.8)
  ax[0].plot(x330, y330, color='black', linewidth=0.8)
  ax[0].plot(x440, y440, color='black', linewidth=0.8)
  ax[0].plot(x550, y550, color='black', linewidth=0.8)
  ax[0].plot(x660, y660, color='black', linewidth=0.8)
  
  legend = ax[0].legend(['Alumínio 7075-T6', 'Titânio Ti-6Al-4V', 'Centro de Torção'], fontsize=8)
  ax[0].add_artist(legend)

  ax[0].set_title('Seção Transversal da Estrutura Alar', fontsize=8)
  ax[0].axis('equal')
  ax[0].set_xlabel('Corda (m)')
  ax[0].set_ylabel('Altura da Caixa (m)')
  ax[0].set_xlim(-c/2-t2, c/2+t2)
  ax[0].set_ylim(-h/2-t1, h/2+t1)
  theta = np.linspace(0,2*np.pi,100)
  r1 = 0.05  

  x1_circulo1 = r1*np.cos(theta)+b1_0+t2/2+c/6
  y1_circulo1 = r1*np.sin(theta)+h1_1-t1/2
  x2_circulo1 = r1*np.cos(theta)+b4_0+t2/2+c/6
  y2_circulo1 = r1*np.sin(theta)+h1_1-t1/2
  x3_circulo1 = r1*np.cos(theta)+b4_0+t2/2+c/6
  y3_circulo1 = r1*np.sin(theta)+h4_0-t1/2
  x4_circulo1 = r1*np.cos(theta)+b1_0+t2/2+c/6
  y4_circulo1 = r1*np.sin(theta)+h4_0-t1/2
  x33_circulo1 = r1*np.cos(theta)+b8_0+t2/2+c/6
  y33_circulo1 = r1*np.sin(theta)+h1_1-t1/2
  x10_circulo1 = r1*np.cos(theta)+b8_0+t2/2+c/6
  y10_circulo1 = r1*np.sin(theta)+h4_0-t1/2
  x44_circulo1 = r1*np.cos(theta)+b1_0+t2/2
  y44_circulo1 = r1*np.sin(theta)+h4_0-t1/2+h/2
  x5_circulo1 = r1*np.cos(theta)+b1_0+t2/2+c/3
  y5_circulo1 = r1*np.sin(theta)+h4_0-t1/2+h/2
  x6_circulo1 = r1*np.cos(theta)+b1_0+t2/2+2*c/3
  y6_circulo1 = r1*np.sin(theta)+h4_0-t1/2+h/2
  x7_circulo1 = r1*np.cos(theta)+b1_0+t2/2+c
  y7_circulo1 = r1*np.sin(theta)+h4_0-t1/2+h/2

  ax[1].plot(x1_circulo1, y1_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x2_circulo1, y2_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x3_circulo1, y3_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x4_circulo1, y4_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x33_circulo1, y33_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x10_circulo1, y10_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x44_circulo1, y44_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x5_circulo1, y5_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x6_circulo1, y6_circulo1, color='white', linewidth=1.5)
  ax[1].plot(x7_circulo1, y7_circulo1, color='white', linewidth=1.5)

  ax[1].text(b1_0+t2/2+c/6, h1_1-t1/2, '1', color='white', ha='center', va='center')
  ax[1].text(b4_0+t2/2+c/6, h1_1-t1/2, '2', color='white', ha='center', va='center')
  ax[1].text(b8_0+t2/2+c/6, h1_1-t1/2, '3', color='white', ha='center', va='center')
  ax[1].text(b1_0+t2/2, h4_0-t1/2+h/2, '4', color='white', ha='center', va='center')
  ax[1].text(b1_0+t2/2+c/3, h4_0-t1/2+h/2, '5', color='white', ha='center', va='center')
  ax[1].text(b1_0+t2/2+2*c/3, h4_0-t1/2+h/2, '6', color='white', ha='center', va='center')
  ax[1].text(b1_0+c+t2/2, h4_0-t1/2+h/2, '7', color='white', ha='center', va='center')
  ax[1].text(b1_0+t2/2+c/6, h4_0-t1/2, '8', color='white', ha='center', va='center')
  ax[1].text(b4_0+t2/2+c/6, h4_0-t1/2, '9', color='white', ha='center', va='center')
  ax[1].text(b8_0+t2/2+c/6, h4_0-t1/2, '10', color='white', ha='center', va='center')

  legend_circulos = ax[1].legend([f'(1) {(tau(0)):.4} Pa',f'(2) {(tau(4)):.4} Pa',f'(3) {(tau(8)):.4} Pa',
                                  f'(4) {(tau(2)):.4} Pa',f'(5) {(tau(3)):.4} Pa',f'(6) {(tau(7)):.4} Pa',
                                  f'(7) {(tau(11)):.4} Pa',f'(8) {(tau(1)):.4} Pa',f'(9) {(tau(5)):.4} Pa',
                                  f'(10) {(tau(9)):.4} Pa'], loc='upper right',handlelength=0, fontsize=8,ncol=3)
  ax[1].add_artist(legend_circulos)


  pot = ax[1].contourf(xx1,yy1,z1, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx2,yy2,z2, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx3,yy3,z3, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx4,yy4,z4, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx5,yy5,z5, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx6,yy6,z6, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx8,yy8,z8, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx9,yy9,z9, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx10,yy10,z10, cmap='jet', levels=30, vmax=v_max, vmin=v_min)
  pot = ax[1].contourf(xx12,yy12,z12, cmap='jet', levels=30, vmax=v_max, vmin=v_min)

  print('Gradiente de Tensão Cisalhante')
  sm = plt.cm.ScalarMappable(cmap='jet', norm=plt.Normalize(vmin=v_min, vmax=v_max))
  sm.set_array([])  
  cbar = fig.colorbar(sm, ax=ax[1])
  cbar.set_label(r'Distribuição da Tensão $\sigma_x (Pa)$', fontsize=10)
  ax[1].set_title('Gradiente de Tensão Sobre a Seção Transversal', fontsize=8)
  ax[1].axis('equal')
  ax[1].set_xlabel('Corda (m)')


  plt.show()
  
  return v_max, v_min