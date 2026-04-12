import { defineStore } from 'pinia'
import { apiFetch } from '~/utils/apiFetch'

type AssociationRule = {
  antecedent: string[]
  consequent: string[]
  confidence: number
  support: number
}

export const useDashboardStore = defineStore('dashboard', {
  state: () => ({
    supports: null as number[] | null,
    chartData: {
      labels: [] as string[],
      datasets: [
        {
          label: 'Confidence',
          backgroundColor: '#696CFF',
          data: [] as number[],
        },
      ],
    },
  }),
  getters: {
    chartOptions(state) {
      return {
        indexAxis: 'x' as const,
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const confidenceValue = ctx.raw
                const dataIndex = ctx.dataIndex
                let supportValue: string | number = '-'
                if (Array.isArray(state.supports) && typeof state.supports[dataIndex] !== 'undefined') {
                  supportValue = state.supports[dataIndex]
                }
                return [
                  `Confidence: ${(confidenceValue * 100).toFixed(1)}%`,
                  `Support: ${supportValue}`,
                ]
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            max: 1,
            ticks: {
              callback: function(value: any, index: number): string[] {
                const storeState = state
                const label = storeState.chartData.labels[index] || ''
                return label.split('\n')
              }
            }
          },
          y: {
            ticks: {
              callback: function(value: any): string {
                return (value * 100).toFixed(0) + '%'
              }
            }
          }
        },
      }
    },
  },
  actions: {
    async fetchAssociationRules() {
      const { $api } = useNuxtApp()

      try {
        const rules = await apiFetch<AssociationRule[]>($api.associations(), {
          credentials: 'include',
          skip403Redirect: true,
        })

        if (rules && Array.isArray(rules) && rules.length > 0) {
          
          const labels = rules.map((rule) => {
            const antecedent = rule.antecedent.join(', ')
            const consequent = rule.consequent.join(', ')
            return `${antecedent}\n→ ${consequent}`
          })
          const confidences = rules.map((rule) => rule.confidence)
          this.supports = Array.isArray(rules) ? rules.map((rule) => rule.support) : null


          this.chartData = {
            labels,
            datasets: [
              {
                label: 'Confidence',
                backgroundColor: '#696CFF',
                data: confidences,
              },
            ],
          }
          
        } else {
          // Set empty chart data
          this.chartData = {
            labels: [],
            datasets: [
              {
                label: 'Confidence',
                backgroundColor: '#696CFF',
                data: [],
              },
            ],
          }
        }
      } catch (error) {
        console.error('❌ FP-Growth Debug: Error fetching association rules:', error)
        // Set empty chart data on error
        this.chartData = {
          labels: [],
          datasets: [
            {
              label: 'Confidence',
              backgroundColor: '#696CFF',
              data: [],
            },
          ],
        }
      }
    },
  },
})

