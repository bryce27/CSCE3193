import javax.swing.JButton;
import javax.swing.JPanel;
import java.awt.Graphics;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.io.File;
// import java.util.ArrayList;

// import javax.swing.JButton;
import java.awt.Color;

class View extends JPanel
{
	JButton b1;
	JButton b2;
	BufferedImage[] images;
	Model model;

	View(Controller c, Model m, Game game)
	{
		// Make a button
		b1 = new JButton("Load Map");
		b2 = new JButton("Save Map");
		b1.addActionListener(c);
		b2.addActionListener(c);
		this.add(b1);
		this.add(b2);

		// Link up to other objects
		c.setView(this);
		model = m;

		// Send mouse events to the controller
		this.addMouseListener(c);

		this.images = new BufferedImage[game.THINGS.length];
		for (int i = 0; i < game.THINGS.length; i++) {
			try {
				String filename = "images/"+game.THINGS[i]+".png";
				// System.out.println("Filename: " + filename);
				this.images[i] = ImageIO.read(new File(filename));
			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
		}
	}

	public void paintComponent(Graphics g)
	{
		// Clear the background
		g.setColor(new Color(128, 255, 255));

		// using this color palette: https://www.color-hex.com/color-palette/100266
		g.setColor(new Color(132,208,125));

		g.fillRect(0, 0, this.getWidth(), this.getHeight());

		for (int i = 0; i < model.things.size(); i++) {
			try {
				int index = model.things.get(i).kind;
				int width = this.images[index].getWidth();
				int height = this.images[index].getHeight();

				g.drawImage(this.images[index], model.things.get(i).x - width / 2, model.things.get(i).y - height/2, null);
			} catch(Exception e) {
				e.printStackTrace(System.err);
				System.exit(1);
			}
		}

		g.setColor(new Color(73,71,134));
		g.fillRect(0, 0, 200, 200);

		g.drawImage(this.images[model.selected_thing], 0, 0, null);
	}
	
	// void removeButton()
	// {
	// 	this.remove(this.b1);
	// 	this.repaint();
	// }
}
