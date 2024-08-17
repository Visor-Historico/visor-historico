require 'rails_helper'

RSpec.describe 'Demos', type: :request do
  describe 'GET /panorama' do
    it 'returns http success' do
      get '/demo/panorama'
      expect(response).to have_http_status(:success)
    end
  end
end
