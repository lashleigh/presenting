class RemoveCoverFromSlideshow < ActiveRecord::Migration
  def self.up
    remove_column :slideshows, :cover
  end

  def self.down
    add_column :slideshows, :cover, :text
  end
end
